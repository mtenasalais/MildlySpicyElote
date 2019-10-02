import os
import glob
import time

from RPLCD import CharLCD
from RPi.gpio import GPIO

lcd = CharLCD(cols=16,rows=2,pin_rs=37,pin_e=35,pins_data=[33,31,29,27], numbering_mode=GPIO.BOARD)


while True:
	lcd.write_string(u"Lord Please")