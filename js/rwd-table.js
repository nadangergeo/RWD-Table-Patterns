/*	Scripts for the tables test page 
		Original author: Maggie Wachs, www.filamentgroup.com
		Author of extended script: Nadan Gergeo
		Date: November 2011
		Dependencies: jQuery, jQuery UI widget factory
*/

+function ($) {
  'use strict';

  // RESPONSIVE TABLE CLASS DEFINITION
  // ==========================

  function ResponsiveTable(element, options) {
      var o = options,
          table = element,
          thead = table.find("thead"),
          tbody = table.find("tbody"),
          hdrCells = thead.find("th"),
          bodyRows = tbody.find("tr"),
          autoHideTrigger = 'auto-on-' + table.attr('id') + '.bs.responsivetable',
          idPrefix = table.attr('id') + '-col-';

      // wrap table in div for scrolling if needed
      if($(table).parent().hasClass('table-scroll-wrapper') === false){
        // console.log('Wrapped table with scroll-wrapper');
        $(table).wrap('<div class="table-scroll-wrapper"/>');
      }
      var tableScrollWrapper = $(table).parent(),
        tableWrapper = tableScrollWrapper.parent();

      // Toolbar
      // -------------------------

      // create a toolbar with buttons.
      
      var btnToolbar = $('<div class="btn-toolbar" />'),
          dropdownGroup = $('<div class="btn-group dropdown-btn-group pull-right" />'),
          dropdownBtn = $('<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">Display <span class="caret"></span></button>'),
          dropdownContainer = $('<ul class="dropdown-menu"/>'),
          autoGroup = $('<div class="btn-group auto-btn-group" />'),
          autoBtn = $('<button class="btn btn-default">Auto</button>'),
          focusGroup = $('<div class="btn-group focus-btn-group" />'),
          focusBtn = $('<button class="btn btn-default"><span class="glyphicon glyphicon-screenshot"></span> Focus</button>');

      if (table.hasClass('auto-on')) {
        autoBtn.addClass('btn-primary');
      }

      focusGroup.append(focusBtn);
      autoGroup.append(autoBtn);
      dropdownGroup.append(dropdownBtn).append(dropdownContainer);

      if(o.addfocusbtn) {
        btnToolbar.append(focusGroup);
      }

      if(o.addautobtn) {
        btnToolbar.append(autoGroup);
      }

      btnToolbar.append(dropdownGroup);

      tableWrapper.prepend(btnToolbar);


      // Setup cells
      // -------------------------
      
      // for each header column
      hdrCells.each(function(i){
        var th = $(this),
            id = th.attr("id");
         
        // assign an id to each header, if none is in the markup
        if (!id) {
          id = idPrefix + i;
          th.attr("id", id);
        }
         
        // create the hide/show toggle for the current column
        if ( th.is("[data-priority]") ) {
          var toggle = $('<li class="checkbox-row"><input type="checkbox" name="toggle-'+id+'" id="toggle-'+id+'" value="'+id+'" /> <label for="toggle-'+id+'">'+th.text()+'</label></li>');
           
          dropdownContainer.append(toggle);

          toggle.click(function(){
            // console.log("cliiiick!");
            var checkbox = toggle.find("input");
            checkbox.prop("checked", !checkbox.prop("checked"));
            checkbox.trigger("change");
          });

          toggle.find("label").click(function(event){
            event.stopPropagation();
          });
           
            toggle.find("input")
            .click(function(event){
              event.stopPropagation();
            })
            .change(function(){ // bind change event on checkbox
              // console.log("checkbox changed");
                var input = $(this),
                  val = input.val(),
                  //all cells under the column, including the header and its clone
                  cells = $(tableScrollWrapper).find("#" + val + ", #" + val + "-clone, [data-columns~="+ val +"]");

                // loop through the cells
                cells.each(function(){
                  var cell = $(this);

                  // is the checkbox checked now?
                  if (input.is(":checked")) {

                    // if the cell is already visible, it means its original colspan was >1
                    // so let's increment the colspan
                    if(cell.css('display') !== 'none'){
                      cell.prop('colSpan', parseInt(cell.prop('colSpan')) + 1);
                    }

                    // show cell
                    cell.show();

                  }
                  // checkbox has been unchecked
                  else {
                      // decrement colSpan if it's not 1 (because colSpan should not be 0)
                      if(parseInt(cell.prop('colSpan'))>1){
                        cell.prop('colSpan', parseInt(cell.prop('colSpan')) - 1);
                      }
                      // otherwise, hide the cell
                      else {
                        cell.hide();
                      }
                  }
                });
            })
            .bind("updateCheck", function(){
                if ( th.css('display') !== 'none') {
                  $(this).prop("checked", true);
                }
                else {
                  $(this).prop("checked", false);
                }
            })
            .trigger("updateCheck");
          } // end if
      }); // end hdrCells loop 

      // assign matching "data-columns" attributes to the associated cells "(cells with colspan>1 has multiple columns).
      // for each body rows
      bodyRows.each(function(){
        var idStart = 0;

        // for each cell
        $(this).find("th, td").each(function(){
          var cell = $(this);
          var columnsAttr = "";

          var colSpan = cell.prop("colSpan");

          // if colSpan is more than 1, give it the class 'spn-cell';
          if(colSpan > 1) {
            cell.addClass('spn-cell');
          }

          var numOfHidden = 0;
          // loop through columns that the cell spans over
          for (var k = idStart; k < (idStart + colSpan); k++) {
            // add column id
            columnsAttr = columnsAttr + " " + idPrefix + k;

            // get colulm header
            var colHdr = $(tableScrollWrapper).find('#' + idPrefix + k);

            // copy class attribute from column header
            var classes = colHdr.attr("class");
            if (classes) { cell.addClass(classes); }

            // copy data-priority attribute from column header
            var dataPriority = colHdr.attr("data-priority");
            if (dataPriority) { cell.attr("data-priority", dataPriority); }

            if(colHdr.css('display')==='none'){
              numOfHidden++;
            }

          }

          //update colSpan to match number of visible columns that i belongs to
          cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));

          //remove whitespace in begining of string.
          columnsAttr = columnsAttr.substring(1);

          //set attribute to cell
          cell.attr("data-columns", columnsAttr);

          //increment idStart with the current cells colSpan.
          idStart = idStart + colSpan;
        });
      });
      
      // update the inputs' checked status and colspans
      $(window).bind("orientationchange resize " + autoHideTrigger, function(){
        dropdownContainer.find("input").trigger("updateCheck");

        // iterate through cells with class 'spn-cell'
        $(table).find('.spn-cell').each( function(){
          var cell = $(this);
          var columnsAttr = cell.attr("data-columns");
          //console.log(columnsAttr);
          columnsAttr = columnsAttr.split(" ");

          var colSpan = columnsAttr.length;
          var numOfHidden = 0;
          for (var i = 0; i < colSpan; i++) {
            if($('#' + columnsAttr[i]).css('display')==='none'){
              numOfHidden++;
            }
          }

          // if one of the columns that the cell belongs to is visible then show the cell
          if(numOfHidden !== colSpan){
            cell.show();
          }

          // console.log('numOfHidden: ' + numOfHidden);
          // console.log("new colSpan:" +Math.max((colSpan - numOfHidden),1));

          //update colSpan to match number of visible columns that i belongs to
          cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));
        });

      });

      // hide toggle button if the list is empty
      if(dropdownContainer.children('li').length === 0){
        dropdownContainer.parent().hide();
      }

      // Sticky table head
      // -------------------------

      //clone table head
      var tableClone = $(table).clone();

      //replace ids
      $(tableClone).attr('id', table.attr('id') + '-clone');
      $(tableClone).find('[id]').each(function() {
        $(this).attr('id', $(this).attr('id') + '-clone');
      });

      // wrap table clone (this is our "sticky table head" now)
      $(tableClone).wrap('<div class="stickyTableHead"/>');
      var stickyTableHead = $(tableClone).parent();

      // give the sticky table head same height as original
      $(stickyTableHead).css("height", thead.height() + 2);

      //insert clone
      $(table).before(stickyTableHead);

      // var bodyRowsClone = $(tableClone).find('tbody').find('tr');

      // bind scroll and resize with updateStickyTableHead
      $(window).bind("scroll resize", function(){
          ResponsiveTable.prototype.updateStickyTableHead(table, stickyTableHead, o.fixednavbar);
      });


    // Auto
    // -------------------------
    autoBtn.click(function(){
      autoBtn.toggleClass('btn-primary');
      table.toggleClass('auto-on');
      tableClone.toggleClass('auto-on');
      $(window).trigger(autoHideTrigger);
    });

    // Focus on single row
    // -------------------------

    // Focus Activator
    focusBtn.click(function(){
      // clear all
      clearAllFocus();

      $(this).toggleClass('btn-primary');
      table.toggleClass('focus-on');
    });

    // bind click
    bodyRows.click(function(){
        // The corresponding row in the cloned table (sticky head)
        //var thisClone = bodyRowsClone.eq($(this).index());

        // only if activated (.i.e the table has the class focus-on)
        if(table.hasClass('focus-on')) {
          var alreadyFocused = $(this).hasClass('focused');

          // clear all
          clearAllFocus();

          if(!alreadyFocused) {
            bodyRows.addClass('unfocused');
            //bodyRowsClone.addClass('unfocused');
            $(this).addClass('focused');
            //$(thisClone).addClass('focused');
          }
        }
      });

      // Clear all focus
      function clearAllFocus(){
        bodyRows.removeClass('unfocused');
        //bodyRowsClone.removeClass('unfocused');
        bodyRows.removeClass('focused');
        //bodyRowsClone.removeClass('focused');
      }
  }

  ResponsiveTable.DEFAULTS = {
    addautobtn: false, // should it have a auto button?
    addfocusbtn: false,  // should it have a focus button?
    fixednavbar: null  // Is there a fixed navbar? The stickyTableHead needs to know about it!
  };

  // Help function for sticky header
  ResponsiveTable.prototype.updateStickyTableHead = function(table, stickyTableHead, fixedNavbar) {
    var thead         = table.find("thead"),
        offsetTop     = table.offset().top,
        scrollTop     = $(window).scrollTop(),
        maxTop        = table.height() - stickyTableHead.height(),
        rubberBandOffset  = (scrollTop + $(window).height()) - $(document).height(),
        top;


    // Check if iOS
    var iOS = false;
    if(
    (navigator.userAgent.match(/iPhone/i)) ||
    (navigator.userAgent.match(/iPad/i)) ||
    (navigator.userAgent.match(/iPod/i))
    ) {

      iOS = true;
    }

    //Is there a fixed navbar?
    if(fixedNavbar) {
      scrollTop = scrollTop + $(fixedNavbar).height();
    }

    // Calculate top property value
    top = scrollTop - offsetTop;
    // accomodate for top border (1px)
    top = top - 1;

    // Make sure the sticky header doesn't slide down too far.
    if(top < 0) {
      top = 0;
    } else if (top > maxTop) {
      top = maxTop;
    }

    // Accomandate for rubber band effect
    if(rubberBandOffset > 0) {
      top = top - rubberBandOffset;
    }

    if ((scrollTop > offsetTop) && (scrollTop < offsetTop + table.height())) {
      if(!iOS){

        //show sticky table head (the clone)
        stickyTableHead.css({ "visibility": "visible", "top": top + "px" });

      } else {

        //show sticky table head (the clone) (animate repositioning)
        stickyTableHead.css({ "visibility": "visible" });
        stickyTableHead.animate({ "top": top + "px" }, 400);

        // hide original table head
        thead.css({ "visibility": "hidden" });
      }
         
    } else {
      if(!iOS){
        stickyTableHead.css({ "visibility": "hidden" });
      } else {

        stickyTableHead.animate({ "top": "0" }, 400, function(){
          // show original table head
          thead.css({ "visibility": "visible" });

          // hide sticky table head (the clone)
          stickyTableHead.css({ "visibility": "hidden" });
        });

      }
    }
  };


  // RESPONSIVE TABLE PLUGIN DEFINITION
  // ===========================

  var old = $.fn.responsiveTable;

  $.fn.responsiveTable = function (option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('bs.responsivetable');
      var options = $.extend({}, ResponsiveTable.DEFAULTS, $this.data(), typeof option === 'object' && option);

      if (!data) {
          $this.data('bs.responsivetable', (data = new ResponsiveTable($this, options)));
      }
      if (typeof option === 'string') {
          data[option]();
      }
    });
  };

  $.fn.responsiveTable.Constructor = ResponsiveTable;


  // RESPONSIVE TABLE NO CONFLICT
  // =====================

  $.fn.responsiveTable.noConflict = function () {
    $.fn.responsiveTable = old;
    return this;
  };

  // RESPONSIVE TABLE DATA-API
  // ==================

  $(window).on('load.bs.responsivetable.data-api', function () {
    $('table[data-responsive="true"]').each(function () {
      var $table = $(this);
      $table.responsiveTable($table.data());
    });
  });


}(jQuery);


// Dropdown
// ==========================

// Prevent dropdown from closing when toggling checkbox
$(document).on('click.dropdown.data-api', '.dropdown-menu .checkbox-row', function (e) {
  e.stopPropagation();
});

// FEATURE DETECTION (instead of Modernizr)
// ==========================

// media queries
function mediaQueriesSupported() {
    return (typeof window.matchMedia !== "undefined" || typeof window.msMatchMedia !== "undefined");
}

// touch
function hasTouch() {
  return 'ontouchstart' in window;
}


$(document).ready(function() {
  // Change `no-js` to `js`
    document.documentElement.className = document.documentElement.className.replace("no-js","js");

  // Add mq/no-mq class to html
  if(mediaQueriesSupported()) {
    jQuery('html').addClass('mq');
  } else {
    jQuery('html').addClass('no-mq');
  }

  // Add touch/no-touch class to html
  if(hasTouch()) {
    jQuery('html').addClass('touch');
  } else {
    jQuery('html').addClass('no-touch');
  }
});