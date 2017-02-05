#!/bin/bash

cd ~/Wallpapers
timeofday=$(date +"%k")

if [ $timeofday -ge 18 ];then
    randomfilename="$(ls | grep '_DARK' | sort -R | tail -1)"
else
    randomfilename="$(ls | sort -R | tail -1)"
fi

escapedfilename=$(printf %q "$randomfilename")
echo $escapedfilename
feh --bg-scale "/home/epse/Wallpapers/$escapedfilename"
