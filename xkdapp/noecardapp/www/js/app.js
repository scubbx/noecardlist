/*
 * Please see the included README.md file for license terms and conditions.
 */


// This file is a suggested starting place for your code.
// It is completely optional and not required.
// Note the reference that includes it in the index.html file.


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false, localdb: false */



// This file contains your event handlers, the center of your application.
// NOTE: see app.initEvents() in init-app.js for event handler initialization code.

// function myEventHandler() {
//     "use strict" ;
// // ...event handler code here...
// }


// ...additional event handlers here...

function refreshMainList(){
    $('#list_mainlist').empty();
    console.log("app.js: refreshMainList()");
    localdb.query('viewinfrastructure/byTitle', { include_docs: true, attachments: true, reduce: false })
        .then(function (results) {
            console.log("app.js: got results");
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
            console.log("app.js: refreshing list");
            $('#list_mainlist').listview("refresh");
        });
}

function showDetails(docid){
    console.log(docid);
    localdb.get(docid)
        .then(function(result){
            
    });
    $.mobile.changePage('#page_details');
    
}