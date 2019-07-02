%if output == "mako":
<%text><%
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

%></%text>
%else:
<%text><%
--[[
Map Lightroom Web Gallery - https://github.com/tmuguet/map-lightroom-gallery

Copyright (c) 2017 Thomas Muguet (https://tmuguet.me)
Portions Copyright (c) 2015-2016 Justin Briggs (http://trialstravails.blogspot.com) from The Gallerific Lightroom Web Gallery

Licensed under the MIT License:
   http://www.opensource.org/licenses/mit-license.php
 ]]
%>
<%

function addSlash(url)
	if ( url ~= "" and string.sub(url,-1,-1) == "/" ) then
		return url
	else
		return url .. "/"
	end
end

--[[ Courtesy of John R. Ellis; https://forums.adobe.com/message/7163901#7163901 ]]
local LrApplication = import 'LrApplication'
local catalog = LrApplication.activeCatalog ()
local idToPhoto = {}
for _, photo in ipairs (catalog:getAllPhotos ()) do
    idToPhoto [photo.localIdentifier] = photo
end

--[[ Define some variables to make locating other resources easier]]
local imgDir = "im"
local theRoot = "./res"
local imgFn = ""

local featuredIm = nil
local featuredPhoto = nil
for i=1,numImages do
    local im = getImage(i)
    local p = idToPhoto[im.imageID]

    if p:getFormattedMetadata("label") ~= "" then
        -- Has a label, use this one
        featureIm = im
        featurePhoto = p
        break
    end

    -- Fallback: use first best rated photo
    if featuredPhoto == nil or featuredPhoto:getRawMetadata("rating") < p:getRawMetadata("rating") then
        featureIm = im
        featurePhoto = p
    end
end

local featuredImage = featureIm.exportFilename .. ".jpg"

function getMapData(im, photo)
    local content_gps=""
    local content_zoom="17"
    local gpsCoords = photo:getRawMetadata("gps")
    local zoom = im.metadata.zoomLevel

    if (gpsCoords ~= nil) then
        content_gps = "data-lat='" .. gpsCoords['latitude'] .. "' data-lng='" .. gpsCoords['longitude'] .. "'"
    end

    if (zoom ~= nil and zoom ~= "") then
        content_zoom = zoom
    end

    return content_gps .. " data-zoom='" .. content_zoom .. "'"
end

function stripTags(str)
	return string.gsub(str, "(%b<>)", "")
end

%></%text>
%endif
<%def name="echo(x)">${items['echo_start']}${x}${items['echo_end']}</%def>
<%def name="echo_strip(x)">${items['echo_strip_start']}${x}${items['echo_strip_end']}</%def>
%if output == 'mako':
<% resFolder = "${site['root']}/res" %>
%else:
<% resFolder = "./res" %>
%endif
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
		<meta name="viewport"  content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		<meta name="generator" content="Map Lightroom Web Gallery plugin v${version} for Adobe Photoshop Lightroom" />
		<meta name="Keywords" content="${echo(items['keywords'])}" />
${items['if']}${items['noIndexing']}${items['then']}
		<meta name="robots" content="noindex,nofollow" />
${items['else']}
		<meta name="robots" content="index,follow" />
${items['endif']}
		<link rel="icon" type="image/png" sizes="72x72" href="${resFolder}/ico/logo-medium-72.png">
		<link rel="apple-touch-icon" sizes="57x57" href="${resFolder}/ico/logo-medium-57.png">
		<link rel="apple-touch-icon" sizes="72x72" href="${resFolder}/ico/logo-medium-72.png">
		<link rel="apple-touch-icon" sizes="114x114" href="${resFolder}/ico/logo-114.png">
		<link rel="apple-touch-icon" sizes="144x144" href="${resFolder}/ico/logo-144.png">

		<title>${echo_strip(items['galleryTitle'])} - ${echo_strip(items['siteTitle'])}</title>
		<meta property="og:title" content="${echo_strip(items['galleryTitle'])} - ${echo_strip(items['siteTitle'])}"/>
		<meta property="og:type" content="website"/>

		<meta property="og:description" content="${echo_strip(items['galleryDescription'])}"/>
		<meta property="og:image" content="${echo(items['canonicalUrlBase'])}/im/lg/${echo(items['galleryFeatured'])}"/>
		<meta property="og:url" content="${echo(items['canonicalUrlBase'])}/index.html" />
		<link rel="canonical" href="${echo(items['canonicalUrlBase'])}/index.html" />

        <link href="${resFolder}/css/gallery.css" rel="stylesheet">
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
        <link href="${resFolder}/css/jquery-ui.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/geoportal-extensions-leaflet@2.0.3/dist/GpPluginLeaflet.css" />

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <script src="${resFolder}/js/jquery.plugins.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.9/jquery.touchSwipe.min.js"></script>

        <script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"></script>

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-easybutton@2.3.0/src/easy-button.css">
        <script src="https://cdn.jsdelivr.net/npm/leaflet-easybutton@2.3.0/src/easy-button.js"></script>

        <script data-key="${echo(items['ignKey'])}" src="https://unpkg.com/geoportal-extensions-leaflet@2.0.3/dist/GpPluginLeaflet.js"></script>
        <script>
            var keyIgn = '${echo(items['ignKey'])}';
        </script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js" integrity="sha256-GcknncGKzlKm69d+sp+k3A2NyQE+jnu43aBl6rrDN2I=" crossorigin="anonymous"></script>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css" integrity="sha256-EFpFyBbuttUJtoocYzsBnERPWee2JYz4cn5nkUBjW0A=" crossorigin="anonymous" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.min.js" integrity="sha256-IqiRR5X1QtAdcq5lG4vBB1/WxwrRCkkjno4pfvWyag0=" crossorigin="anonymous"></script>

        <script src="${resFolder}/leaflet/gpx.js"></script>
        <script src="${resFolder}/leaflet/L.Polyline.SnakeAnim.js"></script>
        <script src="${resFolder}/js/jquery-ui.min.js"></script>
	</head>
	<body>

%if output == 'lightroom':
<%text><% if mode ~= 'preview' then %></%text>
%endif
		<div id="page_loading"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>
%if output == 'lightroom':
<%text><% end %></%text>
%endif

        <div id="header">
        	<div id="progress"></div>
            <div id="nav">
                <button id="btnSlideshow"><i class="fa fa-play" aria-hidden="true"></i> Slideshow</button> | <button id="btnDownloadAll"><i class="fa fa-file-archive-o" aria-hidden="true"></i> Download all</button><br/>
                <a id="btnPrevImage" href="#0" role="button"><i class="fa fa-angle-left" aria-hidden="true"></i> Previous image</a> | <a id="btnDownloadImage" href="#" target="_blank"><i class="fa fa-file-photo-o" aria-hidden="true"></i> Download image</a> | <a id="btnNextImage" href="#1" role="button">Next image <i class="fa fa-angle-right" aria-hidden="true"></i></a>
            </div>
        	<div id="title">
        		<h1><a href="${echo(items['root'])}/"><img src="${resFolder}/logo.png"/> ${echo(items['siteTitle'])}</a></h1>
        		<h2><a href="#0">${echo(items['galleryTitle'])}</a></h2>
        	</div>
        </div>

    	<div id="map"></div>



		<div id="cover-container">
    		<div>
                <div id="cover">
                    <h2>${echo(items['galleryTitle'])}</h2>
                    <p>${echo(items['galleryDescription'])}</p>
                    <div>
                        <canvas id="chart" width="100%" height="100%"></canvas>
                    </div>
                </div>
                <div id="thumbs">
                    <ul>
                        <li class="selected"></li>
%if output == 'mako':
<%text>%for img in gallery['list']:
<%
    if loop.first:
        continue
%></%text>
%else:
<%text><lr:ThumbnailGrid><lr:GridPhotoCell>
<% imgFn = image.exportFilename .. ".jpg" %></%text>
%endif
                        <li>
                            <a class="thumb" href="#${echo(items['loopIndex'])}" rel="history" data-img-lg="im/lg/${echo(items['loopImage'])}" data-img-fl="im/fl/${echo(items['loopImage'])}" style="background-image: url('im/th/${echo(items['loopImage'])}');" ${items['loopData']}></a>
                            <div class="caption">
                                <div class="image-title">${echo(items['loopTitle'])}</div>
                                <div class="image-desc">${echo(items['loopDescription'])}</div>
                            </div>
                        </li>
%if output == 'mako':
<%text>%endfor</%text>
%else:
<%text></lr:GridPhotoCell>
<lr:GridRowEnd></lr:GridRowEnd>
</lr:ThumbnailGrid></%text>
%endif
                    </ul>
                </div>
            </div>
		</div>

		<div id="image-container">
            <div id="container"></div>
            <div id="next"></div>
            <div id="legend"></div>
        </div>

<script src="${resFolder}/js/script.js"></script>

	</body>
</html>
