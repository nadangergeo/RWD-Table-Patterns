/* Scripts for the tables test page 
   Author: Maggie Wachs, www.filamentgroup.com
   Date: November 2011
   Dependencies: jQuery, jQuery UI widget factory
*/






(function( $ ) {
  $.widget( "awesome.table", { // need to come up with a better namespace var...
 
    options: { 
      idprefix: null,   // specify a prefix for the id/headers values
      optMinWidth: null, //  breakpoint (screen width) at which optional columns are visible
      checkContainer: null // container element where the hide/show checkboxes will be inserted; if none specified, the script creates a menu
    },
 
    // Set up the widget
    _create: function() {
      var self = this,
            o = self.options,
            table = self.element,
            thead = table.find("thead"),
            tbody = table.find("tbody"),
            hdrCols = thead.find("th"),
            bodyRows = tbody.find("tr"),
            container = o.checkContainer ? $(o.checkContainer) : $('<div class="table-menu table-menu-hidden" />');         
      
      hdrCols.each(function(i){
         var th = $(this),
               id = th.attr("id"), 
               classes = th.attr("class");
         
         // assign an id to each header, if none is in the markup
         if (!id) {
            id = ( o.idprefix ? o.idprefix : "col-" ) + i;
            th.attr("id", id);
         };
         
         // assign matching "headers" attributes to the associated cells
         // TEMP - needs to be edited to accommodate colspans
         bodyRows.each(function(){
            var thisRow = $(this).find("th, td").eq(i);                        
            thisRow.attr("headers", id);
            if (classes) { thisRow.addClass(classes); };
         });     
         
         // create the hide/show toggles
         // TEMP - hard-coded for now
         toggle = $('<div><input type="checkbox" name="toggle-cols" id="toggle-col-'+i+'" value="'+id+'" /> <label for="toggle-col-'+i+'">'+th.text()+'</label></div>');
         
         if (classes) { toggle.addClass(classes); };
         
         container.append(toggle);
         
         toggle.find("input")
            .change(function(){
               var input = $(this), 
                  val = input.val(), 
                  cols = $("#" + val + ", [headers="+ val +"]");
               
               if (input.is(":checked")) { cols.show(); }
               else { cols.hide(); };		
            })
            .bind("updateCheck", function(){
               if ( th.css("display") ==  "table-cell") {
                  $(this).attr("checked", true);
               }
               else {
                  $(this).attr("checked", false);
               }
            })
            .trigger("updateCheck");            
               
      }); // end hdrCols loop
      
      $(window).resize(function(){
         container.find("input").trigger("updateCheck");
      });
            
      // if no container specified for the checkboxes, create a "Display" menu      
      if (!o.checkContainer) {
         var menuWrapper = $('<div class="table-menu-wrapper" />'),
               menuBtn = $('<a href="#" class="table-menu-btn">Display</a>');
               
         menuBtn.click(function(){
            container.toggleClass("table-menu-hidden");            
            return false;
         });
               
         menuWrapper.append(menuBtn).append(container)
         table.before(menuWrapper);
      };
      
      
              
    },
    
    disable: function() {
		// TBD
	},

	enable: function() {
		// TBD
	}   
    
  });
}( jQuery ) );



$(function(){ // on DOM ready


$(".movies").table({
   idprefix: "mv-",
   optMinWidth: 500
});





$("#scroll-table").click(function(){
	var t = $("table"),
			tWidth = t.width(), 
			rows = t.find("tr"),
			firstBodyRow = t.find("tbody tr:first-child"),
			col1width = firstBodyRow.children().eq(0).width(),
			col2width = firstBodyRow.children().eq(1).width(),
			newTable = $("<table class='clone'><thead></thead><tbody></tbody></table>");

	t.width(tWidth).wrap('<div class="scroll-wrapper"><div class="scrollable"/></div>');
	
	newTable.appendTo(".scroll-wrapper");
	
	rows.each(function(i){
		var r = $(this),
				col1 = r.children().eq(0),
				col2 = r.children().eq(1),
				fixedCol = $( $.merge($.merge([], col1), col2) );
				
		r.height(r.height());			
		
		col1.width(col1width);
		
		col2.css({
				width: col2width,
				left: col1width
			});		
		
		fixedCol.addClass("fixed");
		
		if (i===0) {
			r.clone().appendTo(newTable.find("thead"));
		}
		else {
			r.clone().appendTo(newTable.find("tbody"));
		}
		
		newTable.find("th, td").not(".fixed").remove();
	});
	
	return false;	
});


});  // end DOM ready
