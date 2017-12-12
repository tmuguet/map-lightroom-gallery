<%
import HTMLParser
from time import localtime, strftime

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

%><?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xml:lang="en">

  <title type="html">${site['title']|strip_tags}</title>
  <link href="${site['host']}${site['root']}/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${site['host']}${site['root']}/index.html" rel="alternate" type="text/html" title="${site['title']|strip_tags}"/>
  <updated>${"%Y-%m-%dT%H:%M:%S+00:00" | strftime}</updated>
  <author>
    <name>${site['title']|strip_tags}</name>
  </author>
  <id>urn:md5:${site['md5']}</id>
  <generator uri="https://github.com/tmuguet/map-lightroom-gallery">map-lightroom-gallery</generator>


%for gallery in galleries:
  <entry>
    <title>${gallery['title']|strip_tags}</title>
    <link href="${site['host']}${site['root']}/${gallery['path']}/" rel="alternate" type="text/html" title="${gallery['title']|strip_tags}" />
    <id>urn:md5:${gallery['md5']}</id>
    <published>${strftime('%Y-%m-%dT%H:%M:%S+00:00', localtime(gallery['date']))}</published>
    <updated>${strftime('%Y-%m-%dT%H:%M:%S+00:00', localtime(gallery['date']))}</updated>
    <author><name>${site['title']|strip_tags}</name></author>
    <content type="html">
        <h1>${gallery['title']|strip_tags}</h1>
        <p><a href="${site['host']}${site['root']}/${gallery['path']}/">Read</a></p>
    </content>
  </entry>
%endfor
</feed>
