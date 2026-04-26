#!/usr/bin/env python3
from gpiozero import OutputDevice
from time import sleep

relay = OutputDevice(17, active_high=False)
relay.on()
sleep(1)
relay.off()
