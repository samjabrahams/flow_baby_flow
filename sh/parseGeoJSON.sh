#!/bin/bash

#This script iterates through the file 90 times, outputting data from each state in a spearate file

#Begin block happens once, middle block happens for each line in the file matching the pattern between //
#END block happens once at the end
#loop from 01 to 90 in increments of 1
for c in {01..90..1}
do

awk 'BEGIN{printf "{\n\"type\": \"FeatureCollection\",\n\"features\": [" >> "'$c'.txt"}
/{ "type":.*"STATE": "'$c'",.*/ {print $0 "\n," >> "'$c'.txt"}
END{printf "\n]\n}" >> "'$c'.txt"}' countyGeo.json
done
