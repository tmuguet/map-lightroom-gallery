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

%><!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
		<meta name="viewport"  content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" /> <!-- for mobile devices -->
		<meta name="Keywords" content="" />
		<meta name="robots" content="index,follow" />
        <link rel="shortcut icon" href="${site['root']}/res/ico/logo.ico">
        <link rel="apple-touch-icon-precomposed" sizes="144x144" href="${site['root']}/res/ico/logo-144.png">
        <link rel="apple-touch-icon-precomposed" sizes="114x114" href="${site['root']}/res/ico/logo-114.png">
        <link rel="apple-touch-icon-precomposed" sizes="72x72" href="${site['root']}/res/ico/logo-medium-72.png">
        <link rel="apple-touch-icon-precomposed" href="${site['root']}/res/ico/logo-medium-57.png">

		<title>${site['title']|strip_tags}</title>
		<meta property="og:title" content="${site['title']|strip_tags}" /> <!-- opengraph used by facebook et al -->
		<meta property="og:type" content="website" />
		<meta property="og:image" content="${site['host']}${site['root']}/${galleries[0]['path']}/im/lg/${galleries[0]['featured']}" />
		<meta property="og:url" content="${site['host']}${site['root']}/index.html" />
		<link rel="canonical" href="${site['host']}${site['root']}/index.html" />

        <link href="${site['root']}/res/css/homepage.css" rel="stylesheet">
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />
        <link rel="stylesheet" href="${site['root']}/res/leaflet/GpPluginLeaflet.css" />

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>

        <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>

        <script src="${site['root']}/res/leaflet/GpPluginLeaflet.js"></script>
        <script>
            var keyIgn = '${site['ign-key']}';
        </script>

        <script src="${site['root']}/res/leaflet/gpx.js"></script>
	</head>
	<body>

		<div id="header">
        	<div id="progress"></div>
            <div id="nav">
%for link in site['links'][0]:
%if not loop.first:
|
%endif
                <a href="${link['link']}" title="${link['title']|strip_tags}"><i class="fa ${link['icon']}" aria-hidden="true"></i> ${link['title']|strip_tags}</a>
%endfor
<br/>
%for link in site['links'][1]:
%if not loop.first:
|
%endif
                <a href="${link['link']}" title="${link['title']|strip_tags}"><i class="fa ${link['icon']}" aria-hidden="true"></i> ${link['title']|strip_tags}</a>
%endfor
            </div>
        	<div id="title">
        		<h1><a href="${site['root']}"><img src="${site['root']}/res/logo.png"/> ${site['title']}</a></h1>
        	</div>
        </div>

    	<div id="map"></div>

		<div id="cover-container">
    		<div>
                <div id="cover"
%if 'bounds' in site:
data-bounds-min-lat="${site['bounds'][0][0]}" data-bounds-min-lng="${site['bounds'][0][1]}" data-bounds-max-lat="${site['bounds'][1][0]}" data-bounds-max-lng="${site['bounds'][1][1]}"
%endif
>
                    <h2>Randonnées</h2>
                    <ul>
%for gallery in galleries:
                        <li
%if 'track' in gallery:
data-track="${gallery['track']}"
%elif 'bounds' in gallery:
data-bounds-min-lat="${gallery['bounds'][0][0]}" data-bounds-min-lng="${gallery['bounds'][0][1]}" data-bounds-max-lat="${gallery['bounds'][1][0]}" data-bounds-max-lng="${gallery['bounds'][1][1]}"
%endif
style="background-image: url('${gallery['path']}/im/th/${gallery['featured']}')"><a href="${gallery['path']}/"><span>${gallery['title']}</span></a></li>
%endfor
                    </ul>
                    <h2 style="display: none">Randonnées sans photos</h2>
                    <ul style="display: none">
%for track in site['additional-tracks']:
                        <li data-track-additional="${track}"></li>
%endfor
                    </ul>
                </div>
            </div>
		</div>
        <script src="${site['root']}/res/js/homepage.js"></script>
	</body>
</html>
