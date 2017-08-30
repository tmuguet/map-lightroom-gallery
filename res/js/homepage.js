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

        promises.push(loadTrack(trackName).done(function() {
            self.data("trackData", this);
            if (bounds == undefined)
                bounds = this.getBounds();
            else
                bounds.extend(this.getBounds());
        }).fail(function() {
            self.removeAttr("data-track");
        }));
    });

    var timeout = undefined;
    $.when.apply($, promises).always(function() {
        if (bounds != undefined) {
            map.fitBounds(bounds, {padding: [200, 200]});

            $("li[data-track]").hover(function() {
                var track = $(this).data("trackData");
                track.setStyle({color: '#72B026'});
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function() {map.flyToBounds(track.getBounds(), {padding: [200, 200]});}, 500);
            }, function() {
                $(this).data("trackData").setStyle({color: '#38AADD'});
                if (timeout)
                    clearTimeout(timeout);
                map.flyToBounds(bounds, {padding: [200, 200]});
            });
        }
    });
};
