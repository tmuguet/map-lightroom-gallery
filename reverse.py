#!/usr/bin/python

import argparse
import json
import os
import shutil
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description='Reverses the list of images')
parser.add_argument('source', metavar='source', help='gallery')

args = parser.parse_args()

if not os.path.isdir(args.source) or not os.path.isfile(os.path.join(args.source, 'info.json')):
    print "Error: can't find source '%s'" % (args.source)
    exit(1)

print "Inversing list..."
with open(os.path.join(args.source, 'info.json'), 'r') as destination_data:
    destination = json.load(destination_data)

    destination['list'].pop(0)
    destination['list'] = destination['list'][::-1]
    destination['list'].insert(0, {})

with open(os.path.join(args.source, 'info.json'), 'w') as destination_data:
    destination_data.write(json.dumps(destination, sort_keys=True, indent=4, separators=(',', ': ')))
