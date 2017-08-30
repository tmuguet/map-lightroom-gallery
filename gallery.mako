<%
import HTMLParser

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

%>



<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
		<meta name="viewport"  content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		<meta name="generator" content="Map Lightroom Web Gallery plugin v0.3.0 for Adobe Photoshop Lightroom" />
		<meta name="Keywords" content="${gallery['keywords']}" />
%if gallery['noIndexing']:
		<meta name="robots" content="noindex,nofollow" />
%else:
		<meta name="robots" content="index,follow" />
%endif

		<title>${gallery['title']|strip_tags} - ${site['title']|strip_tags}</title>
		<meta property="og:title" content="${gallery['title']|strip_tags} - ${site['title']|strip_tags}"/>
		<meta property="og:type" content="website"/>

		<meta property="og:description" content="${gallery['description']|strip_tags}"/>
		<meta property="og:image" content="${gallery['canonicalUrlBase']}/im/lg/${gallery['featured']}"/>
		<meta property="og:url" content="${gallery['canonicalUrlBase']}/index.html" />
		<link rel="canonical" href="${gallery['canonicalUrlBase']}/index.html" />

        <link href="${site['root']}/res/css/gallery.css" rel="stylesheet">
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
        <link href="${site['root']}/res/css/jquery-ui.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />
        <link rel="stylesheet" href="${site['root']}/res/leaflet/GpPluginLeaflet.css" />

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <script src="${site['root']}/res/js/jquery.plugins.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.9/jquery.touchSwipe.min.js"></script>

        <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>

        <script src="${site['root']}/res/leaflet/GpPluginLeaflet.js"></script>
        <script>
            var keyIgn = '${site['ign-key']}';
        </script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js" integrity="sha256-GcknncGKzlKm69d+sp+k3A2NyQE+jnu43aBl6rrDN2I=" crossorigin="anonymous"></script>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css" integrity="sha256-EFpFyBbuttUJtoocYzsBnERPWee2JYz4cn5nkUBjW0A=" crossorigin="anonymous" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.min.js" integrity="sha256-IqiRR5X1QtAdcq5lG4vBB1/WxwrRCkkjno4pfvWyag0=" crossorigin="anonymous"></script>

        <script src="${site['root']}/res/leaflet/gpx.js"></script>
        <script src="${site['root']}/res/leaflet/L.Polyline.SnakeAnim.js"></script>
        <script src="${site['root']}/res/js/jquery-ui.min.js"></script>
	</head>
	<body>

		<div id="page_loading"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>

        <div id="header">
        	<div id="progress"></div>
            <div id="nav">
                <button id="btnSlideshow"><i class="fa fa-play" aria-hidden="true"></i> Slideshow</button> | <button id="btnDownloadAll"><i class="fa fa-file-archive-o" aria-hidden="true"></i> Download all</button><br/>
                <a id="btnPrevImage" href="#0" role="button"><i class="fa fa-angle-left" aria-hidden="true"></i> Previous image</a> | <a id="btnDownloadImage" href="#"><i class="fa fa-file-photo-o" aria-hidden="true"></i> Download image</a> | <a id="btnNextImage" href="#1" role="button">Next image <i class="fa fa-angle-right" aria-hidden="true"></i></a>
            </div>
        	<div id="title">
        		<h1><a href="${site['root']}/">${site['title']}</a></h1>
        		<h2><a href="#0">${gallery['title']}</a></h2>
        	</div>
        </div>

    	<div id="map"></div>



		<div id="cover-container">
    		<div>
                <div id="cover">
                    <h2>${gallery['title']}</h2>
                    <p>${gallery['description']}</p>
                    <div>
                        <canvas id="chart" width="100%" height="100%"></canvas>
                    </div>
                </div>
                <div id="thumbs">
                    <ul>
                        <li></li>
%for img in gallery['list']:
<%
    if loop.first:
        continue
%>
                        <li>
                            <a class="thumb" href="#${loop.index}" data-img-lg="im/lg/${img['image']}" data-img-fl="im/fl/${img['image']}" style="background-image: url('im/th/${img['image']}');" ${'data-lat="' + str(img['lat']) + '"' if 'lat' in img else ''} ${'data-lng="' + str(img['lng']) + '"' if 'lng' in img else ''} data-zoom="${img['zoom']}"></a>
                            <div class="caption">
                                <div class="image-title">${img['title']}</div>
                                <div class="image-desc">${img['description']}</div>
                            </div>
                        </li>
%endfor
                    </ul>
                </div>
            </div>
		</div>

		<div id="image-container">
            <div id="container"></div>
            <div id="next"></div>
            <div id="legend"></div>
        </div>

<script src="${site['root']}/res/js/script.js"></script>

	</body>
</html>
