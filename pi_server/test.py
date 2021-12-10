import time
import board
import busio
import adafruit_ads1x15.ads1015 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from w1thermsensor import W1ThermSensor, AsyncW1ThermSensor
sensor = W1ThermSensor()
#sensor = AsyncW1ThermSensor()

# Create the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Create the ADC object using the I2C bus
ads = ADS.ADS1015(i2c)

# Create single-ended input on channel 0
# Create differential input between channel 0 and 1
#chan = AnalogIn(ads, ADS.P0, ADS.P1)

chan = AnalogIn(ads, ADS.P0)
chan1 = AnalogIn(ads, ADS.P1)


print("{:>5}\t{:>5}\t{:>5}".format('ph', 'air C', 'water C'))

while True:
    temperature = sensor.get_temperature()
    print("{:>5.3f}\t{:>5.1f}\t{:>5}".format(chan.voltage/5*14, (chan1.voltage*100-32)*5/9, temperature))
    #time.sleep(0.5)
