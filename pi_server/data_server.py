import os
import time
import smbus
import select
import socket
import platform
import datetime
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
POWER_BUTTON = 14 # adapt to your wiring
LED = 4 # adapt to your wiring
I2C_ADDR  = 0x27 # I2C device address
LCD_WIDTH = 16   # Maximum characters per line
LCD_CHR = 1 # Mode - Sending data
LCD_CMD = 0 # Mode - Sending command
LCD_LINE_1 = 0x80 # LCD RAM address for the 1st line
LCD_LINE_2 = 0xC0 # LCD RAM address for the 2nd line
LCD_LINE_3 = 0x94 # LCD RAM address for the 3rd line
LCD_LINE_4 = 0xD4 # LCD RAM address for the 4th line
LCD_BACKLIGHT  = 0x08  # On
#LCD_BACKLIGHT = 0x00  # Off
E_PULSE = 0.0005
E_DELAY = 0.0005
ENABLE = 0b00000100 # Enable bit
bus = smbus.SMBus(1)


dir_name = os.path.join(os.path.dirname(os.path.realpath(__file__)), "config.db")
engine = create_engine("sqlite:///"+dir_name+"?check_same_thread=False")
Session = sessionmaker(bind=engine)
s = Session()


def cleanAndExit():
    print("Cleaning...")
    lcd_string("                ",LCD_LINE_1)
    lcd_string("                ",LCD_LINE_2)
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

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(POWER_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.add_event_detect(POWER_BUTTON, GPIO.RISING, callback=shutdown, bouncetime=300)
    GPIO.setup(LED, GPIO.OUT)
    GPIO.output(LED,GPIO.HIGH)

    # Initialise display
    lcd_byte(0x33,LCD_CMD) # 110011 Initialise
    lcd_byte(0x32,LCD_CMD) # 110010 Initialise
    lcd_byte(0x06,LCD_CMD) # 000110 Cursor move direction
    lcd_byte(0x0C,LCD_CMD) # 001100 Display On,Cursor Off, Blink Off 
    lcd_byte(0x28,LCD_CMD) # 101000 Data length, number of lines, font size
    lcd_byte(0x01,LCD_CMD) # 000001 Clear display
    time.sleep(E_DELAY)

def debug(text):
    if VERBOSE:
        print("Debug:---" + text)

def getSerial():
    # Extract serial from cpuinfo file
    cpuserial = "0000000000000000"
    if platform.system() == "Windows":
        try:
            cpuserial = subprocess.check_output(
                'wmic csproduct get uuid').decode().split('\n')[1].strip()
        except:
            cpuserial = "00000000-0000-0000-0000-000000000000"
    elif platform.system() == "Linux":
        try:
            f = open('/proc/cpuinfo', 'r')
            for line in f:
                if line[0:6] == 'Serial':
                    cpuserial = line[10:26]
            f.close()
        except:
            cpuserial = "ERROR000000000"
    
    return cpuserial

def getFirst(model):
    row = s.query(model).first()
    # if a row exists, return it
    if row:
        return row
    # Create and return a new row for the model if it doesn't exist
    else:
        s.add(model(
            Serial=getSerial(),
            CreatedDateUTC=int(datetime.datetime.now().timestamp() * 1000)
        ))
        s.commit()
        return s.query(model).first()

def lcd_byte(bits, mode):
  # Send byte to data pins
  # bits = the data
  # mode = 1 for data
  #        0 for command

  bits_high = mode | (bits & 0xF0) | LCD_BACKLIGHT
  bits_low = mode | ((bits<<4) & 0xF0) | LCD_BACKLIGHT

  # High bits
  bus.write_byte(I2C_ADDR, bits_high)
  lcd_toggle_enable(bits_high)

  # Low bits
  bus.write_byte(I2C_ADDR, bits_low)
  lcd_toggle_enable(bits_low)

def lcd_toggle_enable(bits):
  # Toggle enable
  time.sleep(E_DELAY)
  bus.write_byte(I2C_ADDR, (bits | ENABLE))
  time.sleep(E_PULSE)
  bus.write_byte(I2C_ADDR,(bits & ~ENABLE))
  time.sleep(E_DELAY)

def lcd_string(message,line):
  # Send string to display

  message = message.ljust(LCD_WIDTH," ")

  lcd_byte(line, LCD_CMD)

  for i in range(LCD_WIDTH):
    lcd_byte(ord(message[i]),LCD_CHR)

# ---------------------- class SocketHandler ------------------------
class SocketHandler(Thread):
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
        lcd_string("Waiting for a   ",LCD_LINE_1)
        lcd_string("connection...   ",LCD_LINE_2)
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
                lcd_string("0.00 kg         ",LCD_LINE_1)
                lcd_string("                ",LCD_LINE_2)

    def calibrateTare(self):
            self.hx.reset()
            self.hx.tare_A()
            lcd_string("Tare Finished   ",LCD_LINE_1)
            lcd_string("                ",LCD_LINE_2)
            self.conn.sendall(("cmd_tareDone*").encode())

    def calibrateWeight(self, cal_weight):
        boolean = True
        weight_arr = []
        while boolean:
            try:
                self.hx.set_reference_unit_A(1)
                val = self.hx.get_weight_A(5)
                self.conn.sendall(('weight_' + str(round(val))+'*').encode())
                
                lcd_string(str(round(val)),LCD_LINE_1)
                lcd_string("                ",LCD_LINE_2)

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
                    lcd_string(str(round(max(0, val) /1000, 2)) + ' kg',LCD_LINE_1)
                    lcd_string("                ",LCD_LINE_2)
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
                        lcd_string("Remove Weight   ",LCD_LINE_2)
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

# ----------------- End of SocketHandler -----------------------

setup()
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
    lcd_string("Waiting for a   ",LCD_LINE_1)
    lcd_string("connection...   ",LCD_LINE_2)
    isConnected = False
    while True:
        debug("Calling blocking accept()...")
        conn, addr = serverSocket.accept()
        print("Connected with client at " + addr[0])
        lcd_string("Connected with  ",LCD_LINE_1)
        lcd_string(addr[0],LCD_LINE_2)
        isConnected = True
        socketHandler = SocketHandler(conn)
        # necessary to terminate it at program termination:
        socketHandler.setDaemon(True)  
        socketHandler.start()
        t = 0
        while isConnected:
            print("Server connected at" + str(t) + "s")
            time.sleep(10)
            t += 10
except:
    cleanAndExit()
