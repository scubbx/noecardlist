/*jshint browser:true */
/*global $ , refreshMainList:false */(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
     /* button  Liste */
    
    
        /* button  Liste */
    
    
        /* button  Liste */
    $(document).on("click", ".uib_w_19", function(evt)
    {
        /* your code goes here */ 
        $.mobile.changePage('#page_main');
    });
    
        /* button  Refresh */
    $(document).on("click", ".uib_w_8", function(evt)
    {
        /* your code goes here */ 
        refreshMainList();
    });
    
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();
