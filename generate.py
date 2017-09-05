#!/usr/bin/python

import HTMLParser
import json
import os
import shutil

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

dir_path = os.path.dirname(os.path.realpath(__file__))

gallery_template = Template(filename=os.path.join(dir_path, "gallery.mako"), input_encoding='utf-8', output_encoding='utf-8')
homepage_template = Template(filename=os.path.join(dir_path, "homepage.mako"), input_encoding='utf-8', output_encoding='utf-8')

with open(os.path.join(dir_path, 'params.json'), 'r') as site_data:
    site = json.load(site_data)

    dirs = [f for f in os.listdir('.') if os.path.isdir(os.path.join('.', f)) and os.path.isfile(os.path.join('.', f, 'info.json'))]
    dirs.sort(reverse=True)

    galleries = []

    for g in dirs:
        print "Generating %s..." % g

        with open(os.path.join(g, 'info.json'), 'r') as gallery_data:
            gallery = json.load(gallery_data)

            gallery['path'] = g
            gallery['canonicalUrlBase'] = site['root'] + ('' if site['root'].endswith('/') else '/') + g + '/'

            if not os.path.isfile(os.path.join('.', g, 'track.gpx')):
                print "[%s] Warning: could not find track.gpx" % (g)
            elif os.stat(os.path.join('.', g, 'track.gpx')).st_size == 0:
                print "[%s] Warning: track.gpx is empty" % (g)
                os.remove(os.path.join('.', g, 'track.gpx'))
            else:
                gallery['track'] = g + '/track.gpx'

            if 'track' not in gallery:
                # Fallback to compute bounds
                bounds = None
                for img in gallery['list']:
                    if 'lat' in img and 'lng' in img:
                        if bounds is None:
                            bounds = [[img['lat'], img['lng']], [img['lat'], img['lng']]]
                        else:
                            bounds[0][0] = min(bounds[0][0], img['lat'])
                            bounds[0][1] = min(bounds[0][1], img['lng'])
                            bounds[1][0] = max(bounds[1][0], img['lat'])
                            bounds[1][1] = max(bounds[1][1], img['lng'])

                if bounds is not None:
                    gallery['bounds'] = bounds
                else:
                    print "[%s] Warning: no photo has location data" % (g)


            for img in gallery['list']:
                if 'description' not in img or img['description'] == "RICOH IMAGING":
                    img['description'] = ""

            with open(os.path.join(g, 'index.html'), 'w') as out:
                out.write(gallery_template.render(site=site, gallery=gallery))

            shutil.rmtree(os.path.join(g, 'res'))
            shutil.copytree(os.path.join(dir_path, 'res'), os.path.join(g, 'res'))

            galleries.append(gallery)

    print "Generating homepage..."
    with open('index.html', 'w') as out:
        out.write(homepage_template.render(site=site, galleries=galleries))

    shutil.rmtree('res')
    shutil.copytree(os.path.join(dir_path, 'res'), 'res')
