#!/usr/bin/python

import argparse
import json
import os
import shutil
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description='Merges two galleries together')
parser.add_argument('source', metavar='source', help='source gallery; will be removed')
parser.add_argument('destination', metavar='destination', help='destination gallery; will contain the source gallery')
parser.add_argument('--prepend', '-p', action='store_true', help='prepend source gallery to destination gallery')

args = parser.parse_args()

if not os.path.isdir(args.source) or not os.path.isfile(os.path.join(args.source, 'info.json')):
    print "Error: can't find source '%s'" % (args.source)
    exit(1)

if not os.path.isdir(args.destination) or not os.path.isfile(os.path.join(args.destination, 'info.json')):
    print "Error: can't find destination '%s'" % (args.destination)
    exit(1)

print "Moving images..."
for size in ['fl', 'lg', 'th']:
    for i in os.listdir(os.path.join(args.source, 'im', size)):
        os.rename(os.path.join(args.source, 'im', size, i), os.path.join(args.destination, 'im', size, i))

print "Merging infos..."
with open(os.path.join(args.destination, 'info.json'), 'r') as destination_data:
    destination = json.load(destination_data)

    with open(os.path.join(args.source, 'info.json'), 'r') as source_data:
        source = json.load(source_data)

        if args.prepend:
            destination['featured'] = source['featured']
            destination['list'].pop(0)
            destination['list'] = source['list'] + destination['list']
        else:
            source['list'].pop(0)
            destination['list'] = destination['list'] + source['list']

with open(os.path.join(args.destination, 'info.json'), 'w') as destination_data:
    destination_data.write(json.dumps(destination, sort_keys=True, indent=4, separators=(',', ': ')))

if os.path.isfile(os.path.join(args.destination, 'track.gpx')) and os.stat(os.path.join(args.destination, 'track.gpx')).st_size > 0:
    if os.path.isfile(os.path.join(args.source, 'track.gpx')) and os.stat(os.path.join(args.source, 'track.gpx')).st_size > 0:
        print "Merging tracks..."

        ET.register_namespace('', 'http://www.topografix.com/GPX/1/1')
        source_root = ET.parse(os.path.join(args.source, 'track.gpx')).getroot()
        dest_tree = ET.parse(os.path.join(args.destination, 'track.gpx'))
        dest_root = dest_tree.getroot()
        for child in source_root:
            dest_root.append(child)

        dest_tree.write(os.path.join(args.destination, 'track.gpx'))

    else:
        print "Using only track from destination '%s'..." % (args.destination)

else:
    if os.path.isfile(os.path.join(args.source, 'track.gpx')) and os.stat(os.path.join(args.source, 'track.gpx')).st_size > 0:
        print "Using only track from source '%s'..." % (args.source)
        os.replace(os.path.join(args.source, 'track.gpx'), os.path.join(args.destination, 'track.gpx'))

    else:
        print "No tracks in source '%s' or destination '%s'" % (args.source, args.destination)


print "Cleaning..."
shutil.rmtree(args.source)
