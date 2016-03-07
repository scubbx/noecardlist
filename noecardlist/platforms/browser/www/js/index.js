var localdb;
var remotedb;
var map;
var mainmap;
var marker;
var mainmapmarkers;
var trainstations;
var trainstationsmarker;
var coords = [47.86,15.16];

document.addEventListener('deviceready', initApp, false);

function initApp(){
    $('#list_mainlist').hide();
    $('#page_details').one("pageshow", initMap);
    initMainMap();
    $('#page_map').one("pageshow", mainmap.invalidateSize);
    initDatabase();
};

function initMap(){
    map = L.map('map').setView(coords, 13);
    marker = L.marker(coords).addTo(map);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);
};

function initMainMap(){
    mainmap = L.map('mainmap').setView(coords, 13);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(mainmap);
    console.log("invalidate now");
    
    // load data about train stations (4km buffer regions)
    $.getJSON( "../zugstationen_4km_wgs.geojson", function( data ) {
        trainstations = data;
        trainstationsmarker = L.layerGroup();
        for (var entrynumber in trainstations.features) {
            var trainstation = trainstations.features[entrynumber];
            //console.log(trainstation.geometry.coordinates[0]);
            var corrected_coordinates = _.map(trainstation.geometry.coordinates[0], function(coords){ return coords.reverse(); });
            var poly = L.polygon(corrected_coordinates);
            //console.log(poly);
            poly.addTo(trainstationsmarker);
        }
        //trainstations = L.geoJson(data);
        trainstationsmarker.addTo(mainmap);
    });
    mainmapmarkers = L.layerGroup();
    mainmapmarkers.addTo(mainmap);
    mainmap.invalidateSize();
};

function initDatabase() {
    PouchDB.plugin(geopouch);
    remotedb = new PouchDB('http://gi88.geoinfo.tuwien.ac.at:5984/noecard');
    localdb = new PouchDB('noecard');
    console.log(localdb.adapter);
    //localdb.destroy().then(function(msg){ localdb = new PouchDB('noecard'); });
    
    PouchDB.replicate(remotedb, localdb, {batch_size: 25})
    .on('complete', function(info){
        console.log("sync: complete");
        console.log(info);
        refreshMainList();
        
        //initPouchSync();
    })
    .on('error', function(info){
        console.log("sync: error");
        //alert("error");
        console.log(info);
    })
    .on('change', function(info){
        console.log("sync: change");
        //alert("change");
        console.log(info);
        $('#loadinginfo').html("Lade Daten (" + info.docs_written + " Einträge) ...");
    });
}

function initPouchSync(){
    PouchDB.sync(localdb, remotedb, {live: true, retry: true})
    .on('change', function(info){ 
        //setStatusIcon("refresh");
        console.log("sync: change");
        refreshMainList();
        })
    .on('paused', function(info){
        //setStatusIcon("check");
        console.log("sync: paused");
        })
    .on('active', function(info){
        //setStatusIcon("delete");
        console.log("sync: active");
        })
    .on('error', function(info){
        //setStatusIcon("delete");
        console.log("sync: error");
        });
}

function parseOpeningHours(timeString){
    console.log("Original timeString: " + timeString);
    
}

function refreshMainList(){
    $('#list_mainlist').hide();
    $('#list_mainlist').empty();
    console.log("app.js: refreshMainList()");
    localdb.query('viewinfrastructure/byTitle', { include_docs: true, attachments: false, reduce: false })
        .then(function (results) {
            console.log("app.js: refreshMainList(): got results");
            var rows = results.rows;
            updateMainMap(rows);
            for (var entrynumber in rows) {
                var newListEntry = "";
                var clickCommand = "showDetails('"+rows[entrynumber].id+"')";
                newListEntry = '<li>';
                newListEntry += '<a onclick="'+ clickCommand +'" href="#page_details" data-transition="slide"><img id="listimage_'+ rows[entrynumber].id +'" src="img/noecard.jpg" />';
                newListEntry += '<h2>'+ rows[entrynumber].key +'</h2>';
                newListEntry += '<p id="listdetail_'+ rows[entrynumber].id +'"></p>';
                newListEntry += '</a></li>';
                $('#list_mainlist').append(newListEntry);
                
                // now, also fetch the preview images
                localdb.get(rows[entrynumber].id, { include_docs: true, attachments: true, reduce: false })
                    .then(function(result){
                        //console.log(result);
                        if (result._attachments !== undefined){
                            var imageAttachment = result._attachments['preview.jpg'].data;
                            $("#listimage_"+result._id).attr("src","data:image/jpeg;base64,"+ imageAttachment);
                        }
                        $("#listdetail_"+result._id).text(result.open);
                    });
                
            }
            console.log("app.js: refreshMainList(): refreshing list");
            $('#loadinginfo').hide();
            $('#list_mainlist').listview("refresh");
            $('#list_mainlist').show();
        });
}

function updateMainMap(docList){
    for (docIndex in docList) {
        doc = docList[docIndex].doc;
        if (doc.coordinates.length > 1) {
            // console.log("add");
            var docMarker = L.marker(doc.coordinates.reverse()).bindPopup('<p><b>'+ doc.title +'</b><br />'+ doc.addr +'</p>');
            mainmapmarkers.addLayer(docMarker);
        }
    };
};

function showDetails(docid){
    //console.log(docid);
    localdb.get(docid, { include_docs: true, attachments: true, reduce: false })
        .then(function(result){
            //console.log(result);
            $('#details_header_text').text(result.title);
            $('#details_details').text(result.description);
            $('#details_cheaper').text('€ ' + result.price);
        /*
            localdb.getAttachment(docid, 'preview.jpg')
            .then(function(imageBlob){
                var imageUrl = URL.createObjectURL(imageBlob);
                $('#details_details').text(imageUrl);
                $('#details_image').attr('src',imageUrl);
            }).catch(function(err){
                $('#details_details').text(err);
            });
        */
            $('#details_image').attr('src',"data:image/jpeg;base64,"+ result._attachments['preview.jpg'].data);
            coords = result.coordinates.reverse();
            map.setView(coords, 12);
            marker.setLatLng(coords);
            //map.invalidateSize();
    });
    //$.mobile.changePage('#page_details');
}

// localdb.spatial('viewinfrastructure/points', [15.545998,48.370734,15.6847,48.438654]).then( function(res){ console.log(res); } );
