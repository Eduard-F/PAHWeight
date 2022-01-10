import os
import sys
import time
import select
import socket
import asyncio
import platform
import statistics
import RPi.GPIO as GPIO
from pijuice import PiJuice
from threading import Thread
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from hx711 import HX711
from models import Config

VERBOSE = False
IP_PORT = 22000
POWER_BUTTON = 3 # adapt to your wiring
LED = 4 # adapt to your wiring


dir_name = os.path.join(os.path.dirname(os.path.realpath(__file__)), "config.db")
engine = create_engine("sqlite:///"+dir_name+"?check_same_thread=False")
Session = sessionmaker(bind=engine)
s = Session()


def cleanAndExit():
    print("Cleaning...")
    GPIO.output(LED,GPIO.LOW)
    GPIO.cleanup()    
    print("Bye!")

def shutdown(var):
    print('shutdown')
    if platform.system() == "Linux":
        pijuice = PiJuice(1, 0x14)
        # Remove power to PiJuice MCU IO pins
        pijuice.power.SetSystemPowerSwitch(0)
        # Remove 5V power to RPi after 30 seconds
        pijuice.power.SetPowerOff(30)
        # Shut down the RPi
        os.system("sudo halt")
    cleanAndExit()

async def getBatteryLvl():
    while True:
        pijuice = PiJuice(1, 0x14)  # Instantiate PiJuice interface object
        status = pijuice.status.GetChargeLevel()
        if 'data' in status:
            print(str(status['data']))
        elif 'error' in status:
            print(status['error'])
        await asyncio.sleep(5)
    

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(POWER_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.add_event_detect(POWER_BUTTON, GPIO.RISING, callback=shutdown, bouncetime=300)
    GPIO.setup(LED, GPIO.OUT)
    GPIO.output(LED,GPIO.HIGH)

def debug(text):
    if VERBOSE:
        print("Debug:---" + text)

def getFirst(model):
    row = s.query(model).first()
    # if a row exists, return it
    if row:
        return row
    # Create and return a new row for the model if it doesn't exist
    else:
        s.add(model())
        s.commit()
        return s.query(model).first()

class SocketHandler():
    def __init__(self, conn):
        Thread.__init__(self)
        self.conn = conn
        self.config = getFirst(Config)
        self.hx = HX711(5, 6, gain=128)
        self.hx.set_reading_format("MSB", "MSB")
        self.hx.set_reference_unit_A(self.config.ReferenceUnitA)
        self.hx.set_offset_A(self.config.OffsetA)
        self.scale_start = False

    def run(self):
        global isConnected
        debug("SocketHandler started")
        while True:
            cmd = ""
            try:
                debug("Calling blocking conn.recv()")
                cmd = self.conn.recv(1024)
                cmd = cmd.decode()
                print(cmd)
            except:
                debug("exception in conn.recv()") 
                # happens when connection is reset from the peer
                break
            debug("Received cmd: " + cmd + " len: " + str(len(cmd)))
            if len(cmd) == 0:
                break
            self.executeCommand(cmd)
        conn.close()
        print("Client disconnected. Waiting for next client...")
        isConnected = False
        debug("SocketHandler terminated")

    def executeCommand(self, msg):
        debug("Calling executeCommand() with  msg: " + msg)
        for cmd in msg.split('*'):
            cmd = cmd.split('_')
            if cmd[0] == "tare":
                self.calibrateTare()
                self.conn.sendall(("cmd_tareDone*").encode())
            elif cmd[0] == "calibrate":
                self.calibrateWeight(int(cmd[1]))
            elif cmd[0] == "weight":
                self.scale_start = True
                self.start_weighing()
            elif cmd[0] == "endWeight":
                self.scale_start = False

    def calibrateTare(self):
            self.hx.reset()
            self.hx.tare_A()
            self.conn.sendall(("cmd_tareDone*").encode())

    def calibrateWeight(self, cal_weight):
        boolean = True
        weight_arr = []
        while boolean:
            try:
                self.hx.set_reference_unit_A(1)
                val = self.hx.get_weight_A(5)
                self.conn.sendall(('weight_' + str(round(val))+'*').encode())
                weight_arr.append(val)
                self.hx.power_down()
                self.hx.power_up()
                if weight_arr.__len__() >= 5:
                    if statistics.pvariance(weight_arr) < 2000 and val > 500:
                        boolean = False
                        self.hx.REFERENCE_UNIT = statistics.mean(weight_arr) / (cal_weight)
                        self.conn.sendall(("cmd_calDone*").encode())
                        self.config.ReferenceUnitA = self.hx.REFERENCE_UNIT
                        self.config.OffsetA = self.hx.OFFSET
                        s.commit()
                        return
                    del weight_arr[0]
                time.sleep(0.01)
            except KeyboardInterrupt:
                self.cleanAndExit()

    def start_weighing(self):
        print('start_weight')
        min_weight = 500
        weight_arr = []
        update_label = True
        while self.scale_start:
            try:
                inReady, outReady, exReady = select.select([conn], [], [], 0.0)
                if (conn in inReady):
                    print('more data has arrived at the TCP socket, returning from Loop_()')
                    break
                val = self.hx.get_weight_A(5)
                # only update the UI if the user is busy weighing
                if update_label:
                    self.conn.sendall(('weight_' + str(max(0, round(val, 2)))+'*').encode())
                
                print('weight_' + str(max(0, round(val, 2))))
                weight_arr.append(val)
                self.hx.power_down()
                self.hx.power_up()
                if weight_arr.__len__() >= 5:
                    mean = statistics.mean(weight_arr)  # get average of the last 5 values
                    if statistics.pvariance(weight_arr) < 10 and val > min_weight and update_label:
                        update_label = False
                        print("cmd_removeWeight_" + str(round(mean,2)))
                        self.conn.sendall(("cmd_removeWeight_" + str(round(mean,2))+'*').encode())

                    # check to see when weight is removed and reset loop
                    elif mean < 10 and val < min_weight and update_label == False:
                        print("cmd_addWeight")
                        self.conn.sendall(("cmd_addWeight*").encode())
                        update_label = True

                    del weight_arr[0]
                time.sleep(0.3)
            except KeyboardInterrupt:
                self.scale_start = False
                cleanAndExit()
            except Exception as e:
                print('Exception: ' + str(e))
                self.scale_start = False


async def main():
    asyncio.create_task(getBatteryLvl())  # create recv_loop as a new asyncio task

    # await task
    serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # close port when process exits:
    serverSocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) 
    debug("Socket created")
    HOSTNAME = "" # Symbolic name meaning all available interfaces
    try:
        serverSocket.bind((HOSTNAME, IP_PORT))
    except socket.error as msg:
        print("Bind failed", msg[0], msg[1])
        # sys.exit()
    serverSocket.listen(10)
    try:
        print("Waiting for a connecting client...")
        isConnected = False
        while True:
            debug("Calling blocking accept()...")
    #         conn, addr = serverSocket.accept()
    #         print("Connected with client at " + addr[0])
    #         isConnected = True
    #         socketHandler = SocketHandler(conn)
    #         # necessary to terminate it at program termination:
    #         socketHandler.setDaemon(True)  
    #         socketHandler.start()
    #         t = 0
    #         while isConnected:
    #             print("Server connected at" + str(t) + "s")
    #             time.sleep(10)
    #             t += 10
    except:
        cleanAndExit()

if __name__ == '__main__':
    asyncio.run(main())