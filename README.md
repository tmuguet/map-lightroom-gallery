# Map Lightroom Web Gallery

**This project is unmaintained. I switched to simply exporting the pictures and building the website via [Hugo](http://gohugo.io/) and my theme [hugo-split-gallery](https://gitlab.com/tmuguet/hugo-split-gallery)**

**Important note:** You will need an [API key from IGN](http://professionnels.ign.fr/ign/contrats) (free) to use the maps.

It is missing a lot of configurations options (color themes, etc.), and rendering is not optimized for mobiles devices.

Loosely based on [The Gallerific Lightroom Web Gallery](http://trialstravails.blogspot.com/2015/07/gallerific.html).

## Using with Lightroom

### Installation

1. Unzip the _Maps.lrwebengine_ folder and copy this to the Lightroom _Web Galleries_ folder. This folder can be opened within Lightroom preferences (Win: _Edit-&gt;Preferences_, Mac: _Lightroom-&gt;Preferences_) by clicking on the “Show Lightroom Presets Folder” button, then opening _Web Galleries_.
    * On Mac this is located under: _/Users/username/Library/Application Support/Adobe/Lightroom/Web Galleries/_
    * On Windows Vista/7/8/10, this is normally under: _C:\Users\username\AppData\Roaming\Adobe\Lightroom\Web Galleries\_
2. (Re-)Start Lightroom; the Maps gallery should appear in the list at the top right under the Web workflow

### Usage

1. As with any web album, select the images you wish to export using the **Library** view in Lightroom. Be sure they have all the metadata you want to include in the album, including GPS location. When you’re happy with the images and their order, open the **Web** view.
2. Select the **Map Lightroom Web Gallery** from the **Layout style** at the top right.
3. Choose the options you want:
    * Site Infos:
        * _Site Title_: name of your website
        * _Collection Title_: name of this gallery
        * _Collection Description_: description of the gallery; will appear on the cover page above the thumbnails
        * _Homepage_: Complete address to the root of your website (e.g. "http://v9.thomasmuguet.info/my-subdirectory", or "/my-subdirectory") - no trailing slash
        * _Destination URL path_: subfolder where the gallery will be stored - no trailing slash
        * _IGN API key_: Key for using the IGN features
    * Appearance:
        * _Slide Size_: Max size to be displayed on the webpage - I set it to 2000px
        * _Full (expanded) Size_: Max size for full-res downloadable images - I set it to 20 000px
        * _Discourage search engines from indexing this site_: indicate to search engines not to index this gallery
        * _Search keywords_: keywords to put in the page metadata for search engines
    * Image Info:
        * _Image Title_: which field will be used as title of each images
        * _Image Description_: which field will be used as description of each images
        * _Map Zoom Level_: which field will be used to indicate which level of zoom to display when the image is displayed (optional)
    * Output Settings:
        * _JPG Quality_: quality (the higher the better quality, but gives larger files) - I set it to 70%
        * _Metadata_: which metadata to have embedded in the exported images
        * _Watermarking_: adds watermarking
4. **Export...** and the resulting HTML pages and resources files will be generated in the folder you selected.
    * The generated folder can then be loaded onto a web server for access via the web - it will not fully work if launched locally from your file browser
    * The plugin automatically picks the featured image: the first photo which has a colored label or, if none, the first best rated photo
    * If a _.gpx_ file is present in the same folder as the featured image, the plugin exports it and displays it on the map
        * Once the album exported, you can replace the _track.gpx_ file besides _index.html_ to load and display another track on the map

## Advanced Usage

### Handling multiple galleries and a homepage

If you have multiple galleries, a script is provided to automatically:
* re-generate them using the latest template,
* mutualize the resources at the root folder,
* and generate a homepage to reference all the galleries

The script relies on some parameters within the _params.json_ file:
```json
{
    "title": "thomasmuguet.info",
    "ign-key": "mykey",
    "host": "http://v9.thomasmuguet.info",
    "root": "/my-subdirectory",
    "links": [
        [{"title": "map2gpx.fr", "link": "https://map2gpx.fr", "icon": "fa-area-chart"}],
        [{"title": "My Github profile", "link": "https://github.com/tmuguet", "icon": "fa-github"}, {"title": "My pro. website", "link": "https://tmuguet.me", "icon": "fa-address-card"}]
    ]
}
```
* `title`: name of your website (as entered in Lightroom in _Site Title_)
* `ign-key`: IGN API key (as entered in Lightroom as _IGN API key_)
* `host`: Complete address of the host of your website (e.g. "http://v9.thomasmuguet.info", without any subfolder) - no trailing slash
* `root`: root of your website (e.g. "/my-subdirectory", or empty if your website is at the root of your domain) - no trailing slash
* `links`: optionally, you can define 2 lists of links to be displayed in top-right corner of the homepage

Here, the samples parameters are for a homepage hosted at _http://v9.thomasmuguet.info/my-subdirectory_.

The script will overwrite the _Sites Infos_ entered in Lightroom. This is handy to be able to switch between multiple IGN API keys (local vs. on server).

To run the script on Mac OS X:
```bash
virtualenv venv
. venv/bin/activate
pip install -r requirements.txt
python generate.py <path/to/root>
```

Use `python generate.py -h` to obtain help.

### Other scripts

Other scripts are provided to:
* merge two galleries together: _merge.py_
* reverse the list of images in a gallery: _reverse.py_

Use `-h` to obtain help on these scripts.

In both cases, you will have to re-generate the galleries using _generate.py_.

### Customizing the templates

You can customize the templates and resources.
When using _generate.py_, it will use:
* the resources from the _res_ folder
* _gallery.mako_ for each gallery's _index.html_
* _homepage.mako_ for the homepage's _index.html_

_gallery.mako_ is, however, re-built automatically so you should not edit it directly.

When using the Lightroom plugin, it will use the resources and templates embedded in the plugin.

To keep resources and templates aligned between this folder and the plugin, you can use _build.py_. It will:
* re-generate _gallery.mako_ from _gallery-master.mako_
* re-generate the templates in _Maps.lrwebengine_ from _gallery-master.mako_
* copy the _res_ folder into _Maps.lrwebengine_

You will have to re-install _Maps.lrwebengine_ after re-building the plugin. You can keep Lightroom opened during the installation; no need to restart it.

## License

Licensed under MIT License. Source code is available at https://github.com/tmuguet/map-lightroom-gallery

This projects relies on:
* [Font Awesome](http://fontawesome.io) by Dave Gandy (SIL OFL 1.1)
* [jQuery](http://jquery.com/) (MIT license)
* [jQuery UI](http://jqueryui.com/) (MIT license)
* [Leaflet](http://leafletjs.com/) (BSD 2-clause "Simplified" License)
* [Leaflet.Polyline.SnakeAnim](https://github.com/IvanSanchez/Leaflet.Polyline.SnakeAnim) by ivan@sanchezortega.es ("THE BEER-WARE LICENSE")
* [Extensions Géoportail](https://github.com/IGNF/geoportal-extensions) (CeCILL-B)
* [chart.js](http://www.chartjs.org/) (MIT license)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) (MIT license)
* Modified version of [GPX plugin for Leaflet](https://github.com/mpetazzoni/leaflet-gpx/) (BSD 2-clause license) - available here: https://github.com/tmuguet/leaflet-gpx/commit/7a8889f0ca2bc3eeb64ca61165c7adba294ccb19
* [jQuery history plugin](https://tkyk.github.io/jquery-history-plugin/) (MIT license)
