var localdb;
var remotedb;

document.addEventListener('deviceready', initApp, false);

function initApp(){
    initDatabase();
};

function initDatabase() {
    remotedb = new PouchDB('http://gi88.geoinfo.tuwien.ac.at:5984/noecard');
    localdb = new PouchDB('noecard');
    console.log(localdb.adapter);
    //localdb.destroy().then(function(msg){alert(msg);});
    //localdb = new PouchDB('noecard');
    
    PouchDB.replicate(remotedb, localdb)
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


function refreshMainList(){
    $('#list_mainlist').empty();
    console.log("app.js: refreshMainList()");
    localdb.query('viewinfrastructure/byTitle', { include_docs: true, attachments: true, reduce: false })
        .then(function (results) {
            console.log("app.js: refreshMainList(): got results");
            var rows = results.rows;
            for (var entrynumber in rows) {
                var newListEntry = "";
                if (rows[entrynumber].doc._attachments !== undefined){
                    var allAttachments = rows[entrynumber].doc._attachments;
                    var imageAttachment = allAttachments['preview.jpg'].data;
                    var clickCommand = "showDetails('"+rows[entrynumber].id+"')";
                    newListEntry = '<li>';
                    newListEntry += '<a onclick="'+ clickCommand +'" href="#"><img src="data:image/jpeg;base64,'+ imageAttachment +'" />';
                    newListEntry += '<h2>'+ rows[entrynumber].id +'</h2>';
                    newListEntry += '<p>'+ rows[entrynumber].doc.open +'</p>';
                    newListEntry += '</a></li>';
                    $('#list_mainlist').append(newListEntry);
                } else {
                    newListEntry = '<li>';
                    newListEntry += '<a href="#"><img src="data:image/jpeg;base64," />';
                    newListEntry += '<h2>'+ rows[entrynumber].id +'</h2>';
                    newListEntry += '<p>'+ rows[entrynumber].doc.open +'</p>';
                    newListEntry += '</a></li>';
                    $('#list_mainlist').append('<li><a href="#"><img src="data:image/jpeg;base64,'+ "" +'" /><h2>'+ rows[entrynumber].id +'</h2><p>'+ rows[entrynumber].doc.open +'</p></a></li>');
                }
            }
            console.log("app.js: refreshMainList(): refreshing list");
            $('#list_mainlist').listview("refresh");
        });
}

function showDetails(docid){
    console.log(docid);
    localdb.get(docid, { include_docs: true, attachments: true, reduce: false })
        .then(function(result){
            console.log(result);
            $('#details_header_text').text(result.title);
            $('#details_details').text(result.description);
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
    });
    $.mobile.changePage('#page_details');
    
}
