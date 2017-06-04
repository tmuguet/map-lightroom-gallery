# Map Lightroom Web Gallery

**Important note:** You will need an [API key from IGN](http://professionnels.ign.fr/ign/contrats) (free) to use the maps.

It is missing a lot of configurations options (color themes, etc.), and rendering is not optimized for mobiles devices.

Loosely based on [The Gallerific Lightroom Web Gallery](http://trialstravails.blogspot.com/2015/07/gallerific.html).

## Installation

1. Unzip the _Maps.lrwebengine_ folder and copy this to the Lightroom _Web Galleries_ folder. This folder can be opened within Lightroom preferences (Win: _Edit-&gt;Preferences_, Mac: _Lightroom-&gt;Preferences_) by clicking on the “Show Lightroom Presets Folder” button, then opening _Web Galleries_.
    * On Mac this is located under: _/Users/username/Library/Application Support/Adobe/Lightroom/Web Galleries/_
    * On Windows Vista/7/8/10, this is normally under: _C:\Users\username\AppData\Roaming\Adobe\Lightroom\Web Galleries\_
2. (Re-)Start Lightroom; the Maps gallery should appear in the list at the top right under the Web workflow

## Usage

1. As with any web album, select the images you wish to export using the **Library** view in Lightroom. Be sure they have all the metadata you want to include in the album, including GPS location. When you’re happy with the images and their order, open the **Web** view.
2. Select the **Map Lightroom Web Gallery** from the **Layout style** at the top right.
3. Choose the options you want. Enter titles, descriptions, customize your image captions. Choose the size of the gallery image slide and an expanded full size image to be generated, as well as caption metadata and watermark to include. You can use the **Preview in Browser** button to check out your album’s appearance. And then simply **Export to disk** or **Upload** (to a server via FTP/SFTP) the complete album when you’re ready! The resulting HTML pages and supporting files will be generated in the folder or server location you selected.
    * The generated folder can then be loaded onto a web server for access via the web - it will not fully work if launched locally from your file browser

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
* Modified version of [GPX plugin for Leaflet](https://github.com/mpetazzoni/leaflet-gpx/) (BSD 2-clause license)
* [jQuery history plugin](https://tkyk.github.io/jquery-history-plugin/) (MIT license)
