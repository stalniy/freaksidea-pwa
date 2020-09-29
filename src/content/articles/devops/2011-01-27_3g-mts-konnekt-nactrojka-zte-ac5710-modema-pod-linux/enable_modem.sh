#!/bin/bash

if [ "$(id -u)" != "0" ]; then
   echo 'You need be a root';
   exit 1;
fi;

is_switched=$(lsusb | grep -o '19d2:ffff');
if [ -z "$is_switched" ]; then
   if [ -z "$(lsusb | grep -o '19d2:fff5')" ]; then
      echo 'Device did not attache. Please see "lsusb" to determine the problem';
      exit 1;
   fi
fi


rmmod option;
rmmod usbserial;
if [ -z "$is_switched" ]; then
   usb_modeswitch;
fi

sleep 2;
modprobe usbserial vendor=0x19d2 product=0xffff;
modprobe option;

sleep 2;
wvdial -C /root/.wvdial.conf;
