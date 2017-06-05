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

    var plotMarker = null;
    var ctx = $("#chart");
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Altitude',
                data: [],
                fill: false,
                borderColor: 'rgba(12, 98, 173, 0.8)',
                backgroundColor: 'rgba(12, 98, 173, 0.8)',
                lineTension: 0,
                pointRadius: 0,
                yAxisId: 'alt'
            }]
        },
        options: {
            maintainAspectRatio: false,
            hover: {
                mode: 'index',
                intersect: false,
                onHover: function(event, active) {
                    if (event.type == "mousemove") {
                        if (active && active.length > 0) {
                            var idx = active[0]._index;
                            var item = chart.config.data.datasets[0].data[idx];
                            if (plotMarker == null) {
                                plotMarker = L.marker(L.latLng(item.lat, item.lng), {
                                    icon : new L.Icon.Default("orange"),
                                    draggable : false,
                                    clickable : false,
                                    zIndexOffset : 10000
                                });

                                plotMarker.addTo(map);
                            } else {
                                plotMarker.setLatLng(L.latLng(item.lat, item.lng));
                                plotMarker.update();
                            }
                        } else {
                            if (plotMarker) {
                                map.removeLayer(plotMarker);
                                plotMarker = null;
                            }
                        }
                    } else if (event.type == "mouseout") {
                        if (plotMarker) {
                            map.removeLayer(plotMarker);
                            plotMarker = null;
                        }
                    }
                }
            },
            scales: {
                xAxes: [{
                    id: 'distance',
                    type: 'linear',
                    position: 'bottom',
                    gridLines: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        zeroLineColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        fontColor: '#C0C0C0',
                        min: 0,
                    }
                }],
                yAxes: [{
                    id: 'alt',
                    type: 'linear',
                    position: 'left',
                    beginAtZero: false,
                    gridLines: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        zeroLineColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        fontColor: '#C0C0C0'
                    }
                  }]
            },
            legend: {
                display: false
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function(tooltipItems, data) {
                        return 'Distance: ' + Math.floor(tooltipItems[0].xLabel*100)/100 + "km";
                    },
                    label: function(tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label +': ' + Math.round(tooltipItems.yLabel*100)/100 + 'm';
                    }
                }
            }
        }
    });

    var track = undefined;
    var def = $.Deferred(function() {
        var self = this;

        var line = new L.GPX("track.gpx", {async: true});
        line.on('failed', function(e) {
            console.log("Failed to retrieve track");
            $("#chart").parent().remove();  // Remove chart (don't need it)

            var firstThumb = $("#thumbs a.thumb[data-lat]:eq(0)");  // Take first thumb that has location data and use it for initial state of map
            map.flyTo([firstThumb.attr("data-lat"), firstThumb.attr("data-lng")], firstThumb.attr("data-zoom")-2);
            def.resolve();
        });
        line.on('loaded', function(e) {
            track = e.target;
            map.fitBounds(track.getBounds(), {padding: [200, 200]});
            track.addTo(map);

            var latlngs = track.getLatLngs();
            var ele = track.get_elevation_data();

            var s = latlngs.length;
            var data = [{x: ele[0][0]*1000, y: ele[0][1], lat: latlngs[0].lat, lng: latlngs[0].lng}];

            for (var i = 1; i < s; i++) {
                var localDistance = ele[i][0] - data[data.length-1].x; // km
                if (localDistance > 0.010) {
                    data.push({x: ele[i][0], y: ele[i][1], lat: latlngs[i].lat, lng: latlngs[i].lng});
                }
            }

            chart.options.scales.xAxes[0].ticks.max = data[data.length-1].x;
            chart.options.scales.yAxes[0].ticks.min = track.get_elevation_min();
            chart.options.scales.yAxes[0].ticks.max = track.get_elevation_max();
            chart.config.data.datasets[0].data = data;
            chart.update();
            def.resolve();
            track.snakeIn();
        });
    });

    // Load thumbnails that are further down the page
    setTimeout(function(){
        $("img.delayload").each(function () {
        $(this).attr('src', $(this).data('src'));
        $(this).show();
    }); }, 1200);

    var start = new Date();
    var maxTime = 5000;
    var timeoutVal = Math.floor(maxTime/100);

    function updateProgress(percentage) {
        $('#progress').css("width", percentage + "%");
    }

    function animateUpdate() {
        var now = new Date();
        var timeDiff = now.getTime() - start.getTime();
        var perc = Math.round((timeDiff/maxTime)*100);
        if (perc <= 100) {
            $('#progress').css("width", perc + "%");
            slideshowTimeout = setTimeout(animateUpdate, timeoutVal);
        } else {
            galleryNext();
        }
    }

    function gallerySetTimeout() {
        start = new Date();
        $('#progress').css("width", "0%");
        animateUpdate();
    }

    function galleryShow(img) {
        var index = $("#thumbs li").index(img);
        $.history.load(index);

        var selectedIndex = $("#thumbs li").index($("#thumbs li.selected"));

        if (index == 0) {
            $("#cover-container").fadeIn(400);
            $("#map").animate({width: '100%'}, {
                duration: 400,
                progress: function() {
                    map.invalidateSize(false);
                },
                complete: function() {
                    map.invalidateSize(false);
                    if (track && selectedIndex > 0)
                        map.flyToBounds(track.getBounds(), {padding: [200, 200]});
                },
            });
            $("#container").fadeOut(400);
            $("#image-container").fadeOut(400);

            $("#btnDownloadImage").animate({opacity: 0.3});
        } else {
            var link = img.find("a.thumb");
            var flyTo = link.attr("data-lat") && link.attr("data-lng") && link.attr("data-zoom");

            if (selectedIndex < 1) {    // 0 or none selected
                $("#cover-container").fadeOut(400, function() {$("#image-container").fadeIn(400);});
                $("#map").animate({width: '30%'}, {
                    duration: 1000,
                    progress: function() {
                        map.invalidateSize(false);
                    },
                    complete: function() {
                        map.invalidateSize(false);
                        if (flyTo)
                            map.flyTo([link.attr("data-lat"), link.attr("data-lng")], link.attr("data-zoom"));
                    },
                });
                $("#btnDownloadImage").animate({opacity: 1});
            } else {
                var clone = $("#container").clone();
                clone.insertAfter($("#container"));
                clone.fadeOut(400, function() {
                    clone.remove();
                });
                if (flyTo)
                    map.flyTo([link.attr("data-lat"), link.attr("data-lng")], link.attr("data-zoom"));
            }

            $("#container").css('background-image', "url('" + link.attr("data-img-lg") + "')").fadeIn(400);
            $("#legend").text(img.find(".image-desc").text());
            $("#btnDownloadImage").attr("href", link.attr("data-img-fl"));
        }
        $("#thumbs li").removeClass("selected");
        img.addClass("selected");
        if (img.next().length > 0) {
            $("#btnNextImage").attr("href", "#" + (index+1));
            $("#btnNextImage").animate({opacity: 1});
            $("#next").css('background-image', "url('" + img.next().find("a.thumb").attr("data-img-lg") + "')");
        } else {
            $("#btnNextImage").animate({opacity: 0.3});
        }
        if (img.prev().length > 0) {
            $("#btnPrevImage").animate({opacity: 1});
            $("#btnPrevImage").attr("href", "#" + (index-1));
        } else {
            $("#btnPrevImage").animate({opacity: 0.3});
        }
    }
    function galleryNext() {
        var current = $("#thumbs li.selected");
        var next = current.next();
        if (next.length > 0) {
            galleryShow(next);
            if (isSlideshowRunning)
                gallerySetTimeout();
        }
    }
    function galleryPrevious() {
        var current = $("#thumbs li.selected");
        var prev = current.prev();
        if (prev.length > 0) {
            galleryShow(prev);
        }
    }
    function galleryGotoIndex(index) {
        var goto = $("#thumbs li").eq(index);
        if (goto.length > 0) {
            galleryShow(goto);
        }
    }
    var isSlideshowRunning = false;
    var slideshowTimeout = undefined;
    function galleryToggleSlideshow() {
        if (!isSlideshowRunning) {
            isSlideshowRunning = true;
            $("#header .fa-play").removeClass("fa-play").addClass("fa-pause");
            gallerySetTimeout();
        } else {
            isSlideshowRunning = false;
            $("#header .fa-pause").removeClass("fa-pause").addClass("fa-play");
            $('#progress').css("width", "0%");
            if (slideshowTimeout) {
                clearTimeout(slideshowTimeout);
                slideshowTimeout = undefined;
            }
        }
    }
    $("#btnSlideshow").click(galleryToggleSlideshow);
    $("#btnPrevImage").click(function(e) {galleryPrevious(); e.preventDefault();});
    $("#btnNextImage").click(function(e) {galleryNext(); e.preventDefault();});
    $("#container").click(galleryNext);
    $("#cover-container").click(galleryNext);

    $('#container, #cover-container').swipe({
        // swipe events for images (on container to allow swiping on empty space; important not to allow up/down so page scroll works)
        swipeLeft:function(event, direction, distance, duration, fingerCount) {
            if (fingerCount==1)  galleryNext();
        },
        swipeRight:function(event, direction, distance, duration, fingerCount) {
            if (fingerCount==1)  galleryPrevious();
        },
        fingers: $.fn.swipe.fingers.ALL,
        excludedElements: "button, input, select, textarea, .noSwipe", // NOT a
        threshold: 75
    });

    $(document).keydown(function(e) {
        if (e.altKey || e.ctrlKey || e.shiftKey) return; // ignore special combinations
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        switch(key) {
            case 32: // space
                galleryToggleSlideshow();
                e.preventDefault();
                break;
            case 35: // End
                galleryGotoIndex(-1);
                e.preventDefault();
                break;
            case 36: // Home
                galleryGotoIndex(0);
                e.preventDefault();
                break;
            case 37: // left arrow
                galleryPrevious();
                e.preventDefault();
                break;
            case 39: // right arrow
                galleryNext();
                e.preventDefault();
                break;
        }
    });

    /* Handle download all button invocation; jszip loading is deferred until here */
    function downloadAll() {
        $("#btnDownloadAll").attr("disabled", "disabled");
        $("#btnDownloadAll i.fa").removeClass('fa-file-archive-o').addClass('fa-spinner').addClass('fa-spin');
        $("#btnDownloadAll").append("<span class='progress'>... starting</span>");

        function showMessage(text, alerttype) {
            $("body").append('<div id="dialog-message" title="Download"><p>' + text + '</p></div>');
            $("#dialog-message").dialog({
              modal: true,
              buttons: {
                Ok: function() {
                  $(this).dialog( "close" );
                }
              },
              close: function( event, ui ) {$(this).dialog("destroy"); $("#dialog-message").remove();}
            });

            $("#btnDownloadAll").removeAttr("disabled");
            $("#btnDownloadAll i.fa").addClass('fa-file-archive-o').removeClass('fa-spinner').removeClass('fa-spin');
            $("#btnDownloadAll .progress").remove();
        }

        $.getScript('./res/js/jszip-all.min.js', function() {
            try {
                var isFileSaverSupported = !!new Blob;
            } catch (e) {}
            if (!isFileSaverSupported) { /* can't check this until Blob polyfill loads above */
                showMessage("Unsupported browser. Try upgrading.", "alert-danger");
                return false;
            }

            var zip = new JSZip();

            var Promise = window.Promise;
            if (!Promise) {
                Promise = JSZip.external.Promise;
            }
            // add file to the zip-to-be
            function addzipfile(zip, path) {
                var filename = path.replace(/.*\//g, ""); // strip path
                zip.file(filename, urlToPromise(path), {binary:true});
            }
            // Fetch the content and return the associated promise that will contain the data.
            function urlToPromise(url) {
                return new Promise(function(resolve, reject) {
                    JSZipUtils.getBinaryContent(url, function (err, data) {
                        if (err)  reject(err);
                        else  resolve(data);
                    });
                });
            }

            $("#thumbs li a.thumb").each(function() {
                var image = $(this).attr("data-img-fl");
                console.log("Adding", image);
                addzipfile(zip, image);
            });

            // asynchronously download all the images into a blob
            zip.generateAsync({type:"blob", streamFiles: true, compression: "STORE"}, function updateCallback(metadata) {
                if (metadata.percent)
                    $("#btnDownloadAll .progress").text('... ' + Math.round(metadata.percent) + '%');
            })
            .then(function callback(blob) {
                $("#btnDownloadAll .progress").text('... downloading');
                saveAs(blob, "gallery.zip");

                setTimeout(function() {
                    $("#btnDownloadAll").removeAttr("disabled");
                    $("#btnDownloadAll i.fa").addClass('fa-file-archive-o').removeClass('fa-spinner').removeClass('fa-spin');
                    $("#btnDownloadAll .progress").remove();
                }, 5000);
            }, function (e) {
                showMessage(e, "alert-danger")
            });
        });
        return false;
    }
    $('#btnDownloadAll').on('click', downloadAll);

    /**** Functions to support integration of galleriffic with the jquery.history plugin ****/
    // This function is called after calling ???.init(), after calling ???.load(), and/or after pushing "Go Back" button of a browser
    function pageload(hash) {
        // alert("pageload: " + hash);
        // hash doesn't contain the first # character.
        if(hash) {
            galleryGotoIndex(hash);
        } else {
            galleryGotoIndex(0);
        }
    }

    // Initialize history plugin; causes the callback to be called by present location.hash.
    $.history.init(pageload);

    // set onlick event for buttons using the jQuery on method
    $("a[rel='history']").on('click', function(e) {
        if (e.button != 0) return true;

        var hash = this.href;
        hash = hash.replace(/^.*#/, '');

        // moves to a new page, where pageload is called at once.
        // hash mustn't contain "#", "?"
        $.history.load(hash);

        return false;
    });

    def.done(function(){
        setTimeout(function() {$("#page_loading").fadeOut(500);}, 500); // Let some time for map tiles to finish to load
    });
};