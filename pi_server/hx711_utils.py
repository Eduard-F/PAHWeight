import time
import sys
import asyncio
import statistics
from qasync import asyncSlot
from db_utils import *

# Force Python 3 ###########################################################
if sys.version_info[0] != 3:
    raise Exception("Python 3 is required.")
############################################################################



class HX711_UTIL():
    def __init__(self, _self):
        self.scale_start = _self.scale_start
        self.EMULATE_HX711 = False
        try:
            import RPi.GPIO as GPIO
            from hx711 import HX711
        except ImportError:
            self.EMULATE_HX711 = True
            from emulated import HX711
        # gain is set to 128 as default, change as needed.
        self.hx = HX711(5, 6, gain=128)
        self.hx.set_reading_format("MSB", "MSB")
        self.hx.REFERENCE_UNIT_A = _self.config.ReferenceUnitA
        self.hx.OFFSET_A = _self.config.OffsetA
        self.hx.reset()
        if self.hx.OFFSET_A == 1 and _self.config.ScaleAEnabled:
            # Calibrate tare if it hasn't been done before
            print('Tare starting...')
            self.ui.label_calibrate_main.setText('Tare starting...')
            self.hx.tare_A(_self)
            self.ui.label_calibrate_main.setText("Tare done! Add weight now...")
        else:
            # use calibrated tare value to reduce weigh time
            self.hx.set_offset_A(self.hx.OFFSET_A)

    async def calibrateWeight(self, scale='A'):
        boolean = True
        weight_arr = []
        while boolean:
            try:
                if scale == 'A':
                    self.hx.REFERENCE_UNIT_A = 1
                    val = self.hx.get_weight_A(5)
                    self.ui.label_calibrate_amount.setText(str(round(val)))
                    weight_arr.append(val)
                    self.hx.power_down()
                    self.hx.power_up()
                    if weight_arr.__len__() >= 5:
                        if statistics.pvariance(weight_arr) < 2000 and val > 500:
                            boolean = False
                            self.hx.REFERENCE_UNIT_A = statistics.mean(weight_arr) / (self.ui.spin_box_calibration.value() * 1000)
                            print(str(self.hx.REFERENCE_UNIT_A))
                            self.ui.label_calibrate_main.setText('Calibration done')
                            self.ui.label_calibrate_amount.setText('0')
                            print('offset save: ' + str(self.hx.OFFSET_A))
                            DB.updateCalibrationA(self.hx.REFERENCE_UNIT_A, self.hx.OFFSET_A)
                            return
                        del weight_arr[0]
                else:
                    self.hx.REFERENCE_UNIT_B = 1
                    val = self.hx.get_weight_B(5)
                    self.ui.label_calibrate_amount.setText(str(round(val)))
                    weight_arr.append(val)
                    self.hx.power_down()
                    self.hx.power_up()
                    if weight_arr.__len__() >= 5:
                        if statistics.pvariance(weight_arr) < 2000 and val > 500:
                            boolean = False
                            self.hx.REFERENCE_UNIT_B = statistics.mean(weight_arr) / (self.ui.spin_box_calibration.value() * 1000)
                            self.ui.label_calibrate_main.setText('Calibration done')
                            self.ui.label_calibrate_amount.setText('0')
                            DB.updateCalibrationB(self.hx.REFERENCE_UNIT_B, self.hx.OFFSET_B)
                            return
                        del weight_arr[0]
                await asyncio.sleep(0.01)
            except KeyboardInterrupt:
                self.cleanAndExit()

    async def calibrateTare(self):
        self.ui.label_calibrate_main.setText('Tare/Offset starting...')
        self.hx.reset()
        self.hx.tare_A(self.window)
        self.ui.label_calibrate_main.setText("Tare/Offset done! Calibrate weight now...")
        self.ui.button_calibrate_weight.show()
        self.ui.label_calibration_weight.show()
        self.ui.spin_box_calibration.show()
        self.ui.button_calibrate_tare.hide()

    async def start_weighing(self):
        min_weight = 500
        weight_arr = []
        update_label = True
        while self.scale_start:
            try:
                val = self.hx.get_weight_A(5)
                # only update the UI if the user is busy weighing
                if update_label:
                    if val >= 1000:
                        self.ui.label_weight_amount_1.setText(str(max(0, round(val/1000, 2))) + ' kg')
                    else:
                        self.ui.label_weight_amount_1.setText(str(max(0, round(val, 2))) + ' g')
                weight_arr.append(val)
                self.hx.power_down()
                self.hx.power_up()
                if weight_arr.__len__() >= 5:
                    mean = statistics.mean(weight_arr)  # get average of the last 5 values
                    if statistics.pvariance(weight_arr) < 10 and val > min_weight and update_label:
                        update_label = False
                        self.ui.label_weight_main_1.setText('Remove Weight')
                        self.ui.label_weight_amount_1.setStyleSheet('background-color: red;font-size: 140px;')
                        
                        # Display in Grams or Kilograms
                        if mean >= 1000:
                            self.ui.label_weight_amount_1.setText(str(round(mean/1000,2)) + ' kg')
                            self.window.UIFunctions.addWidget(self.window, mean)
                        else:
                            self.ui.label_weight_amount_1.setText(str(round(mean,2)) + ' g')
                            self.window.UIFunctions.addWidget(self.window, mean)
                        self.window.weight_array.append({'weight': mean, 'time': int(datetime.datetime.now().timestamp() * 1000)})
                        if len(self.window.weight_array) > 0:
                            self.ui.button_weigh_end.setText('End and Upload')

                    # check to see when weight is removed and reset loop
                    elif mean < 10 and val < min_weight and update_label == False:
                        self.ui.label_weight_main_1.setText('Add new weight')
                        self.ui.label_weight_amount_1.setStyleSheet('background-color: green;font-size: 140px;')
                        self.ui.label_weight_amount_1.setText('0')
                        update_label = True

                    del weight_arr[0]
                await asyncio.sleep(0.3)
            except KeyboardInterrupt:
                self.cleanAndExit()

    def cleanAndExit(self):
        print("Cleaning up...")
        if not self.EMULATE_HX711:
            GPIO.cleanup() 
        print("Bye!")
        # sys.exit()