#!/usr/bin/python

import argparse
import HTMLParser
import json
import os
import shutil
import xml.etree.ElementTree as ET

from mako.template import Template

class MLStripper(HTMLParser.HTMLParser):
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

def mergeBounds(bounds1, bounds2):
    if bounds1 is None:
        bounds = bounds2
    elif bounds2 is None:
        bounds = bounds1
    else:
        bounds = [
            [min(bounds1[0][0], bounds2[0][0]), min(bounds1[0][1], bounds2[0][1])],
            [max(bounds1[1][0], bounds2[1][0]), max(bounds1[1][1], bounds2[1][1])],
        ]
    return bounds

def extendBounds(bounds1, latLng):
    if latLng is None:
        bounds = bounds1
    elif bounds1 is None:
        bounds = [[latLng['lat'], latLng['lng']], [latLng['lat'], latLng['lng']]]
    else:
        bounds = [
            [min(bounds1[0][0], latLng['lat']), min(bounds1[0][1], latLng['lng'])],
            [max(bounds1[1][0], latLng['lat']), max(bounds1[1][1], latLng['lng'])],
        ]
    return bounds


parser = argparse.ArgumentParser(description='Re-generates galleries')
parser.add_argument('source', metavar='source', help='folder of galleries to re-generate')

args = parser.parse_args()

if not os.path.isdir(args.source):
    print "Error: can't find source '%s'" % (args.source)
    exit(1)

dir_path = os.path.dirname(os.path.realpath(__file__))

gallery_template = Template(filename=os.path.join(dir_path, "gallery.mako"), input_encoding='utf-8', output_encoding='utf-8')
homepage_template = Template(filename=os.path.join(dir_path, "homepage.mako"), input_encoding='utf-8', output_encoding='utf-8')
ET.register_namespace('', 'http://www.topografix.com/GPX/1/1')

with open(os.path.join(dir_path, 'params.json'), 'r') as site_data:
    site = json.load(site_data)

    if 'links' not in site:
        site['links'] = [[], []]

    if len(site['links']) < 2:
        site['links'].append([])
        site['links'].append([])

    dirs = [f for f in os.listdir(args.source) if os.path.isdir(os.path.join(args.source, f)) and os.path.isfile(os.path.join(args.source, f, 'info.json'))]
    dirs.sort(reverse=True)

    galleries = []
    homepage_bounds = None

    for g in dirs:
        print "Generating %s..." % g

        with open(os.path.join(args.source, g, 'info.json'), 'r') as gallery_data:
            gallery = json.load(gallery_data)

            gallery['path'] = g
            gallery['canonicalUrlBase'] = site['host'] + site['root'] + '/' + g

            if not os.path.isfile(os.path.join(args.source, g, 'track.gpx')):
                print "[%s] Warning: could not find track.gpx" % (g)
            elif os.stat(os.path.join(args.source, g, 'track.gpx')).st_size == 0:
                print "[%s] Warning: track.gpx is empty" % (g)
                os.remove(os.path.join(args.source, g, 'track.gpx'))
            else:
                gallery['track'] = g + '/track.gpx' # Not using os.path.join because we want a URI


            if 'track' not in gallery:
                # Fallback to compute bounds
                bounds = None
                for img in gallery['list']:
                    if 'lat' in img and 'lng' in img:
                        bounds = extendBounds(bounds, img)

                if bounds is not None:
                    gallery['bounds'] = bounds
                    homepage_bounds = mergeBounds(homepage_bounds, bounds)
                else:
                    print "[%s] Warning: no photo has location data" % (g)
            else:
                source_root = ET.parse(os.path.join(args.source, g, 'track.gpx')).getroot()
                for child in source_root.findall('.//{http://www.topografix.com/GPX/1/1}trkpt'):
                    homepage_bounds = extendBounds(homepage_bounds, {'lat': child.get('lat'), 'lng': child.get('lon')})

            for img in gallery['list']:
                if 'type' in gallery and gallery['type'] == 'collection':
                    img['zoom'] = 13
                    img['description'] = ""
                else:
                    if 'description' not in img or img['description'] in ["RICOH IMAGING", "DCIM@DRIFT"]:
                        img['description'] = ""

            with open(os.path.join(args.source, g, 'index.html'), 'w') as out:
                out.write(gallery_template.render(site=site, gallery=gallery))

            if os.path.isdir(os.path.join(args.source, g, 'res')):
                shutil.rmtree(os.path.join(args.source, g, 'res'))

            galleries.append(gallery)

    print "Generating homepage..."

    if homepage_bounds is not None:
        site['bounds'] = homepage_bounds

    if os.path.isdir(os.path.join(args.source, 'additional-tracks')):
        site['additional-tracks'] = ['additional-tracks/' + f for f in os.listdir(os.path.join(args.source, 'additional-tracks')) if os.path.isfile(os.path.join(args.source, 'additional-tracks', f)) and f.endswith('gpx')]
    else:
        site['additional-tracks'] = []

    with open(os.path.join(args.source, 'index.html'), 'w') as out:
        out.write(homepage_template.render(site=site, galleries=galleries))

    shutil.rmtree(os.path.join(args.source, 'res'))
    shutil.copytree(os.path.join(dir_path, 'res'), os.path.join(args.source, 'res'))
