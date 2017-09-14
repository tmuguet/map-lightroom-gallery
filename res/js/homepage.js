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



    function loadTrack(track) {
        return $.Deferred(function() {
            var self = this;

            var line = new L.GPX(track, {async: true, onSuccess: function() {}, onFail: function() {}});
            line.on('failed', function(e) {
                self.reject();
            });
            line.on('loaded', function(e) {
                track = e.target;
                track.setStyle({weight: 5, color: '#38AADD', opacity: 0.75});
                track.addTo(map);
                self.resolveWith(e.target);
            });
        });
    }

    var bounds = undefined;
    var promises = [];
    var tracksLoaded = {};
    $("li[data-track]").each(function() {
        var self = $(this);
        var trackName = self.attr('data-track');

        promises.push(
            $.Deferred(function() {
                var d = this;

                loadTrack(trackName).done(function() {
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

    var timeout = undefined;

    $.when.apply($, promises).done(function() {
        if (bounds != undefined) {
            map.fitBounds(bounds, fitOpts);

            $("li[data-track]").hover(function() {
                $("li[data-track]").each(function() {
                    $(this).data("trackData").setStyle({opacity: 0.3});
                });
                var track = $(this).data("trackData");
                track.setStyle({color: '#81197f', opacity: 1});
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function() {map.flyToBounds(track.getBounds(), fitOpts);}, 500);
            }, function() {
                $("li[data-track]").each(function() {
                    $(this).data("trackData").setStyle({opacity: 0.75});
                });
                $(this).data("trackData").setStyle({color: '#38AADD'});
                if (timeout)
                    clearTimeout(timeout);
                map.flyToBounds(bounds, fitOpts);
            });

            $("li[data-bounds-min-lat]").hover(function() {
                $("li[data-track]").each(function() {
                    $(this).data("trackData").setStyle({opacity: 0.3});
                });
                var b = $(this).data("bounds");
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function() {map.flyToBounds(b, fitOpts);}, 500);
            }, function() {
                $("li[data-track]").each(function() {
                    $(this).data("trackData").setStyle({opacity: 0.75});
                });
                if (timeout)
                    clearTimeout(timeout);
                map.flyToBounds(bounds, fitOpts);
            });
        }
    });
};
