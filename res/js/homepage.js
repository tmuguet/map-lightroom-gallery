window.onload = function() {
	var map = L.map('map', {zoomControl: false, boxZoom: false, doubleClickZoom: false, dragging: false, keyboard: false, scrollWheelZoom: false, tap: false}).setView([44.92710337178908, 6.291518211364747], 15);

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
    var fitOpts = {paddingTopLeft: [0, 0], paddingBottomRight: [0, $("#cover").height()]};
    $.when.apply($, promises).done(function() {
        if (bounds != undefined) {
            map.fitBounds(bounds, fitOpts);

            $("li[data-track]").hover(function() {
                var track = $(this).data("trackData");
                track.setStyle({color: '#72B026'});
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function() {map.flyToBounds(track.getBounds(), fitOpts);}, 500);
            }, function() {
                $(this).data("trackData").setStyle({color: '#38AADD'});
                if (timeout)
                    clearTimeout(timeout);
                map.flyToBounds(bounds, fitOpts);
            });

            $("li[data-bounds-min-lat]").hover(function() {
                var b = $(this).data("bounds");
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function() {map.flyToBounds(b, fitOpts);}, 500);
            }, function() {
                if (timeout)
                    clearTimeout(timeout);
                map.flyToBounds(bounds, fitOpts);
            });
        }
    });
};
