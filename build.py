#!/usr/bin/python

import os
import shutil

from mako.template import Template

version = "0.3.1"

map_mako = {
    'if': '%if ',
    'then': ':',
    'else': '%else:',
    'endif': '%endif',
    'echo_start': '${',
    'echo_end': '}',
    'echo_strip_start': '${',
    'echo_strip_end': '|strip_tags}',

    'keywords': "gallery['keywords']",
    'noIndexing': "gallery['noIndexing']",
    'galleryTitle': "gallery['title']",
    'galleryDescription': "gallery['description']",
    'siteTitle': "site['title']",
    'root': "site['root']",
    'canonicalUrlBase': "gallery['canonicalUrlBase']",
    'galleryFeatured': "gallery['featured']",
    "ignKey": "site['ign-key']",

    "loopIndex": "loop.index",
    "loopImage": "img['image']",
    "loopData": '${\'data-lat="\' + str(img[\'lat\']) + \'"\' if \'lat\' in img else \'\'} ${\'data-lng="\' + str(img[\'lng\']) + \'"\' if \'lng\' in img else \'\'} data-zoom="${img[\'zoom\']}"',
    "loopTitle": "img['title']",
    "loopDescription": "img['description']",
}
map_lightroom = {
    'if': '<% if ',
    'then': ' then %>',
    'else': '<% else %>',
    'endif': '<% end %>',
    'echo_start': '<%= ',
    'echo_end': ' %>',
    'echo_strip_start': '<%= stripTags(',
    'echo_strip_end': ') %>',

    'keywords': 'model.metadata.keywords',
    'noIndexing': 'model.nonCSS.noIndexing',
    'galleryTitle': "model.metadata.collectionTitle.value",
    'galleryDescription': "model.metadata.collectionDescription.value",
    'siteTitle': "model.metadata.siteTitle.value",
    'root': "model.metadata.siteindex",
    'canonicalUrlBase': "model.metadata.canonicalUrlBase",
    'galleryFeatured': "featuredImage",
    "ignKey": "model.nonCSS.ignApiKey",

    "loopIndex": "cellIndex",
    "loopImage": "imgFn",
    "loopData": '<%= getMapData(image, idToPhoto[image.imageID]) %>',
    "loopTitle": "image.metadata.title",
    "loopDescription": "image.metadata.description",
}

dir_path = os.path.dirname(os.path.realpath(__file__))

gallery_template = Template(filename=os.path.join(dir_path, "gallery-master.mako"), input_encoding='utf-8', output_encoding='utf-8')

with open(os.path.join(dir_path, 'gallery.mako'), 'w') as out:
    out.write(gallery_template.render(output='mako', version=version, items=map_mako))

with open(os.path.join(dir_path, 'Maps.lrwebengine', 'grid.html'), 'w') as out:
    out.write(gallery_template.render(output='lightroom', version=version, items=map_lightroom))

shutil.rmtree(os.path.join(dir_path, 'Maps.lrwebengine', 'res'))
shutil.copytree(os.path.join(dir_path, 'res'), os.path.join(dir_path, 'Maps.lrwebengine', 'res'))

with open(os.path.join(dir_path, 'Maps.lrwebengine', 'version'), 'w') as out:
    out.write(version)
