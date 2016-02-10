/*jshint browser:true */
/*global $ */(function()
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
    
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();
