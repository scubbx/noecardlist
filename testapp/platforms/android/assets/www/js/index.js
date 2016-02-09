$( deviceIsReady );

function deviceIsReady() {
    console.log("deviceIsReady: load");
    // when the map page is loaded, initialize the leaflet map window
    $(document).on('pagecreate', '#page-list', refreshList);
    
    // set up the databases
    remoteDatabase = new PouchDB('http://gi88.geoinfo.tuwien.ac.at:5984/noecard');
    localDatabase = new PouchDB('noecard');
    initSynchronization();
    
    console.log("deviceIsReady: done");
}

function initSynchronization(){
    var syncOptions = {live: true, retry: true};
    var sync = PouchDB.sync(localDatabase, remoteDatabase, syncOptions)
    .on('change', function(info){ 
        //setStatusIcon("refresh");
        console.log("sync: change");
        })
    .on('paused', function(info){
        //setStatusIcon("check");
        refreshList();
        //drawPlacesOnMap();
        console.log("sync: paused");
        })
    .on('active', function(info){
        //setStatusIcon("delete");
        console.log("sync: active");
        })
    .on('error', function(info){
        //setStatusIcon("delete");
        console.log("sync: error");
        })
    .on('complete', function(info){
        //setStatusIcon("delete");
        console.log("sync: complete");
        });
}

function setStatusIcon(status){
    if (status == "refresh") {
        console.log("setStatusIcon: refresh");
        $('.status-icon').toggleClass('ui-icon-refresh', true);
        $('.status-icon').toggleClass('ui-icon-delete', false);
        $('.status-icon').toggleClass('ui-icon-check', false);
    } else if (status == "delete") {
        console.log("setStatusIcon: delete");
        $('.status-icon').toggleClass('ui-icon-refresh', false);
        $('.status-icon').toggleClass('ui-icon-delete', true);
        $('.status-icon').toggleClass('ui-icon-check', false);
    } else if (status == "check") {
        console.log("setStatusIcon: check");
        $('.status-icon').toggleClass('ui-icon-refresh', false);
        $('.status-icon').toggleClass('ui-icon-delete', false);
        $('.status-icon').toggleClass('ui-icon-check', true);
    }
};

function refreshList(){
    localDatabase.query('viewinfrastructure/byTitle', { include_docs: true, attachments: true, reduce: false })
        .then(function (results) {
            //console.log(results.rows);
            $('#listcontent').empty();
            var rows = results.rows;
            for (var entrynumber in rows){
                if (rows[entrynumber].doc._attachments != undefined){
                    var allAttachments = rows[entrynumber].doc._attachments;
                    var imageAttachment = allAttachments[rows[entrynumber].id+'.jpg'].data;
                    $('#listcontent').append('<li><a href="#"><img src="data:image/jpeg;base64,'+ imageAttachment +'" /><h2>'+ rows[entrynumber].id +'</h2><p>'+ rows[entrynumber].doc.open +'</p></a></li>');
                } else {
                    $('#listcontent').append('<li><a href="#"><img src="data:image/jpeg;base64,'+ imageAttachment +'" /><h2>'+ rows[entrynumber].id +'</h2><p>'+ rows[entrynumber].doc.open +'</p></a></li>');
                };
            };
            $('#listcontent').listview('refresh');
        }).catch(function (error) {
            console.log(error);
    });
}
