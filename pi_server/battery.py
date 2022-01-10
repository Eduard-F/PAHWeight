import os
import platform
import datetime
from pijuice import PiJuice
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Config

dir_name = os.path.join(os.path.dirname(os.path.realpath(__file__)), "config.db")
engine = create_engine("sqlite:///"+dir_name+"?check_same_thread=False")
Session = sessionmaker(bind=engine)
s = Session()

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

def getBatteryLvl():
    pijuice = PiJuice(1, 0x14)  # Instantiate PiJuice interface object
    status = pijuice.status.GetChargeLevel()
    print(pijuice.status.GetStatus())
    if 'data' in status:
        res = str(status['data'])
    elif 'error' in status:
        res = status['error']
    config = getFirst(Config)
    print(res)
    config.Battery = res
    s.commit()

getBatteryLvl()