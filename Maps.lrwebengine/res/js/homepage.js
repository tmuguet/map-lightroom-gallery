window.onload = function() {
    var fitOpts = {paddingTopLeft: [0, $("#header").height()], paddingBottomRight: [0, $("#cover").height()]};
	var map = L.map('map', {zoomControl: false, boxZoom: false, doubleClickZoom: false, dragging: false, keyboard: false, scrollWheelZoom: false, tap: false});


    var cover = $("#cover");
    var b;
    if (cover[0].hasAttribute("data-bounds-min-lat")) {
        b = L.latLngBounds(
            L.latLng(cover.attr("data-bounds-min-lat"), cover.attr("data-bounds-min-lng")),
            L.latLng(cover.attr("data-bounds-max-lat"), cover.attr("data-bounds-max-lng"))
        );
    } else {
        b = L.latLngBounds(
            L.latLng(45.495019, 6.647571),   // Magic numbers; bounds around Grenoble
            L.latLng(44.69632, 5.3951)       // so map loads faster
        );
    }

	map.fitBounds(b, fitOpts);

    var lyr = L.geoportalLayer.WMTS({
        layer  : "ORTHOIMAGERY.ORTHOPHOTOS",
        apiKey: keyIgn
    });
    lyr.addTo(map);
    var lyr2 = L.geoportalLayer.WMTS({
        layer  : "GEOGRAPHICALGRIDSYSTEMS.MAPS",
        apiKey: keyIgn}, {
        opacity: 0.25
    });
    lyr2.addTo(map);



    function loadTrack(track, style, item) {
        return $.Deferred(function() {
            var self = this;

            var line = new L.GPX(track, {async: true, onSuccess: function() {}, onFail: function() {}});
            line.on('failed', function(e) {
                self.reject();
            });
            line.on('loaded', function(e) {
                var track = e.target;
                track.setStyle(style);
                track.addTo(map);
                self.resolveWith(e.target);
                if (item !== null) {
                    track.on('mouseover', function (e) {
                        onTrackMouseover(item, 1000);
                    });
                    track.on('mouseout', function (e) {
                        if (timeout)
                            clearTimeout(timeout);
                    });
                }
            });
        });
    }

    var timeout = undefined;
    var popup = undefined;
    var bounds = undefined;
    var promises = [];
    var tracksLoaded = {};

    map.on('popupclose', function (e) {
        if (popup !== undefined) {
            onTrackMouseout(null, 0);
        }
    });

    function onTrackMouseover(item, delay) {
        $("li[data-track], li[data-track-additional]").not(item).each(function() {
            $(this).data("trackData").setStyle({opacity: 0.3, color: '#38AADD'});
        });

        if (popup !== undefined) {
            popup = undefined;
            map.closePopup();
        }

        var track = item.data("trackData");
        var flyTo;
        if (track === undefined) {
            flyTo = item.data("bounds");
        } else {
            track.setStyle({color: '#81197f', opacity: 1});
            flyTo = track.getBounds();
        }

        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(function() {
            var img = item.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            var url = item.find('a').attr('href');
            var title = item.text();
            popup = L.popup({autoPan: false, closeButton: false})
                .setLatLng(flyTo.getCenter())
                .setContent('<p style="text-align: center"><a href="' + url + '" title="' + title + '"><strong>' + title + '</strong><br><img src="' + img + '"/></a></p>')
                .openOn(map);

            map.flyToBounds(flyTo, fitOpts);
        }, delay);
    }
    function onTrackMouseout(item, delay) {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(function() {
            map.flyToBounds(bounds, fitOpts);

            $("li[data-track]").each(function() {
                $(this).data("trackData").setStyle({opacity: 0.75, color: '#38AADD'});
            });
            $("li[data-track-additional]").each(function() {
                $(this).data("trackData").setStyle({opacity: 0.5, color: '#38AADD'});
            });

            if (popup !== undefined) {
                popup = undefined;
                map.closePopup();
            }
        }, delay);
    }

    $("li[data-track]").each(function() {
        var self = $(this);
        var trackName = self.attr('data-track');

        promises.push(
            $.Deferred(function() {
                var d = this;

                loadTrack(trackName, {weight: 5, color: '#38AADD', opacity: 0.75}, self).done(function() {
                    self.data("trackData", this);

                    if (bounds == undefined)
                        bounds = this.getBounds();
                    else
                        bounds.extend(this.getBounds());

                    d.resolve();
                }).fail(function() {
                    self.removeAttr("data-track");
                    d.resolve();
                });
            })
        );
    });
    $("li[data-track-additional]").each(function() {
        var self = $(this);
        var trackName = $(this).attr('data-track-additional');

        promises.push(
            $.Deferred(function() {
                var d = this;

                loadTrack(trackName, {weight: 3, color: '#38AADD', opacity: 0.5}, null).done(function() {
                    self.data("trackData", this);

                    if (bounds == undefined)
                        bounds = this.getBounds();
                    else
                        bounds.extend(this.getBounds());

                    d.resolve();
                }).fail(function() {
                    self.removeAttr("data-track-additional");
                    d.resolve();
                });
            })
        );
    });
    promises.push(
        $.Deferred(function() {
            var d = this;
            $("li[data-bounds-min-lat]").each(function() {
                var self = $(this);
                var b = L.latLngBounds(
                    L.latLng(self.attr("data-bounds-min-lat"), self.attr("data-bounds-min-lng")),
                    L.latLng(self.attr("data-bounds-max-lat"), self.attr("data-bounds-max-lng"))
                );
                if (bounds == undefined)
                    bounds = b
                else
                    bounds.extend(b);
                self.data("bounds", b);
            });
            d.resolve();
        })
    );

    $.when.apply($, promises).done(function() {
        if (bounds != undefined) {
            map.fitBounds(bounds, fitOpts);

            $("li[data-track], li[data-bounds-min-lat]").hover(function() {
                onTrackMouseover($(this), 1000);
            }, function() {
                onTrackMouseout($(this), 2000);
            });
        }
    });
};
