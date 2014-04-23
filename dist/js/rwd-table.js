/*!
 * Responsive Tables v4.3.2 (http://gergeo.se/RWD-Table-Patterns)
 * This is an awesome solution for responsive tables with complex data.
 * Copyright 2011-2014 
 * Authors: Nadan Gergeo <nadan.gergeo@gmail.com> (www.gergeo.se) & Maggie Wachs (www.filamentgroup.com)
 * Licensed under MIT (https://github.com/nadangergeo/RWD-Table-Patterns/blob/master/LICENSE-MIT)
 */
(function ($) {
  'use strict';

  // RESPONSIVE TABLE CLASS DEFINITION
  // ==========================

  var ResponsiveTable = function(element, options) {
      var that = this;
      
      this.options = options;
      this.$table = $(element);
      
      this.$tableWrapper = null; //defined later in wrapTable
      this.$tableScrollWrapper = null; //defined later in wrapTable
      
      this.$tableClone = null; //defined farther down
      this.$stickyTableHead = null; //defined farther down
      
      //good to have - for easy access
      this.$thead = this.$table.find("thead");
      this.$tbody = this.$table.find("tbody");
      this.$hdrCells = this.$thead.find("th");
      this.$bodyRows = this.$tbody.find("tr");

      //toolbar and buttons
      this.$btnToolbar = null; //defined farther down
      this.$dropdownGroup = null; //defined farther down
      this.$dropdownBtn = null; //defined farther down
      this.$dropdownContainer = null; //defined farther down
      
      this.$displayAllGroup = null; //defined farther down
      this.$displayAllBtn = null; //defined farther down
      
      this.$focusGroup = null; //defined farther down
      this.$focusBtn = null; //defined farther down
      
      //misc
      this.displayAllTrigger = 'display-all-' + this.$table.attr('id') + '.responsiveTable';
      this.idPrefix = this.$table.attr('id') + '-col-';
      
      // Check if iOS
      // property to save performance
      this.iOS = false;
      if(
      (navigator.userAgent.match(/iPhone/i)) ||
      (navigator.userAgent.match(/iPad/i)) ||
      (navigator.userAgent.match(/iPod/i))
      ) {
        this.iOS = true;
      }
      
      
      // Setup table
      // -------------------------
      
      //wrap table
      $.proxy(this.wrapTable(), this);

      if(this.options.displayall){
        this.$table.addClass('display-all');
      }
      
      //create toolbar with buttons
      $.proxy(this.createButtonToolbar(), this);


      // Setup cells
      // -------------------------
      
      //setup header cells
      $.proxy(this.setupHdrCells(), this);

      //setup standard cells
      $.proxy(this.setupStandardCells(), this);
      
      //create sticky table head
      $.proxy(this.createStickyTableHead(), this);

      if(that.options.dropdownInTable){
        $.proxy(this.dropdownInTables(), this);
      }
      
      // hide toggle button if the list is empty
      if(this.$dropdownContainer.is(":empty")){
        this.$dropdownGroup.hide();
      }
      
      
      // Window event binding
      // -------------------------
      
      // on orientchange, resize and displayAllBtn-click
      $(window).bind("orientationchange resize " + this.displayAllTrigger, function(){
        
        //update the inputs' checked status
        that.$dropdownContainer.find("input").trigger("updateCheck");
          
        //update colspan and visibility of spanning cells
        $.proxy(that.updateSpanningCells(), that);

      });
      
  };

  ResponsiveTable.DEFAULTS = {
    adddisplayallbtn: false, // should it have a display-all button?
    addfocusbtn: false,  // should it have a focus button?
    fixednavbar: null,  // Is there a fixed navbar? The stickyTableHead needs to know about it!
    displayall: false,
    copyClasses: true,
    dropdownInTable: false //Are there dropdowns in the table? 
  };
    
  // Wrap table
  ResponsiveTable.prototype.wrapTable = function() {
      var that = this;
      
      // wrap table in div for scrolling if needed
      if(that.$table.parent().hasClass('table-responsive') === false){
        // console.log('Wrapped table with scroll-wrapper');
        that.$table.wrap('<div class="table-responsive"/>');
      }
      that.$tableScrollWrapper = that.$table.parent();
      that.$tableWrapper = that.$tableScrollWrapper.parent();
  };
    
  // Create toolbar with buttons
  ResponsiveTable.prototype.createButtonToolbar = function() {
      var that = this;
      
      that.$btnToolbar = $('<div class="btn-toolbar" />');
      
      that.$dropdownGroup = $('<div class="btn-group dropdown-btn-group pull-right" />');
      that.$dropdownBtn = $('<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">Display <span class="caret"></span></button>');
      that.$dropdownContainer = $('<ul class="dropdown-menu"/>');
      
      that.$displayAllGroup = $('<div class="btn-group display-all-btn-group pull-right" />');
      that.$displayAllBtn = $('<button class="btn btn-default">Display all</button>');
      
      if (that.$table.hasClass('display-all')) {
        that.$displayAllBtn.addClass('btn-primary');
      }
      
      that.$focusGroup = $('<div class="btn-group focus-btn-group" />');
      that.$focusBtn = $('<button class="btn btn-default"><span class="glyphicon glyphicon-screenshot"></span> Focus</button>');

      //add focus btn to toolbar
      that.$focusGroup.append(that.$focusBtn);
      if(that.options.addfocusbtn) {
        that.$btnToolbar.append(that.$focusGroup);
      }
      
      //add dropdown btn toolbar
      that.$dropdownGroup.append(that.$dropdownBtn).append(that.$dropdownContainer);
      that.$btnToolbar.append(that.$dropdownGroup);
      
      //add display-all btn to toolbar
      that.$displayAllGroup.append(that.$displayAllBtn);
      if(that.options.adddisplayallbtn) {
        that.$btnToolbar.append(that.$displayAllGroup);
      }

      // add toolbar above table
      that.$tableScrollWrapper.before(that.$btnToolbar);
      
      
      // Bind events
      // -----------------------------------------------
      
      // Display all
      // -------------------------
      this.$displayAllBtn.click(function(){
          that.$displayAllBtn.toggleClass('btn-primary');
          that.$table.toggleClass('display-all');
          that.$tableClone.toggleClass('display-all');
          $(window).trigger(that.displayAllTrigger);
      });

      // Focus on single row
      // -------------------------

      // Focus Activator
      this.$focusBtn.click(function(){
          // clear all
          clearAllFocus();

          $(this).toggleClass('btn-primary');
          that.$table.toggleClass('focus-on');
      });

      // bind click
      that.$bodyRows.click(function(){
          // only if activated (.i.e the table has the class focus-on)
          if(that.$table.hasClass('focus-on')) {
              var alreadyFocused = $(this).hasClass('focused');

              // clear all
              clearAllFocus();

              if(!alreadyFocused) {
                  that.$bodyRows.addClass('unfocused');
                  $(this).addClass('focused');
              }
          }
      });

      // Clear all focus
      function clearAllFocus(){
          that.$bodyRows.removeClass('unfocused');
          that.$bodyRows.removeClass('focused');
      }
  };
    
  ResponsiveTable.prototype.preserveShowAll = function() {
      var that = this;
      
      var displayProp = 'table-cell';
      if($('html').hasClass('lt-ie9')){
          displayProp = 'inline';
      }
      
      $(that.$table).find("th, td").each(function(){
          $(this).css('display', displayProp);
      });
  };
    
  ResponsiveTable.prototype.createStickyTableHead = function() {
      var that = this;
      
      //clone table head
      that.$tableClone = that.$table.clone();

      //replace ids
      that.$tableClone.attr('id', that.$table.attr('id') + '-clone');
      that.$tableClone.find('[id]').each(function() {
        $(this).attr('id', $(this).attr('id') + '-clone');
      });

      // wrap table clone (this is our "sticky table head" now)
      that.$tableClone.wrap('<div class="sticky-table-head"/>');
      that.$stickyTableHead = that.$tableClone.parent();

      // give the sticky table head same height as original
      that.$stickyTableHead.css("height", that.$thead.height() + 2);

      //insert clone
      if($('html').hasClass('lt-ie10')){
          that.$tableScrollWrapper.closest('.container').prepend(that.$stickyTableHead);
      } else {
          that.$table.before(that.$stickyTableHead);
      }

      // var bodyRowsClone = $(tableClone).find('tbody').find('tr');

      // bind scroll and resize with updateStickyTableHead
      $(window).bind("scroll resize", function(){
          $.proxy(that.updateStickyTableHead(), that);
      });
      
      $(that.$tableScrollWrapper).bind("scroll", function(){
          $.proxy(that.updateStickyTableHead(), that);
      });
  };
    
  // Help function for sticky header
  ResponsiveTable.prototype.updateStickyTableHead = function() {
      var that              = this,
          top               = 0,
          offsetTop         = that.$table.offset().top,
          scrollTop         = $(window).scrollTop() -1, //-1 to accomodate for top border
          maxTop            = that.$table.height() - that.$stickyTableHead.height(),
          rubberBandOffset  = (scrollTop + $(window).height()) - $(document).height(),
//          useFixedSolution  = that.$table.parent().prop('scrollWidth') === that.$table.parent().width();
          useFixedSolution  = !that.iOS,
          navbarHeight      = 0;

      //Is there a fixed navbar?
      if(that.options.fixednavbar) {
        var $navbar = $(that.options.fixednavbar);
        navbarHeight = $navbar.height();
        scrollTop = scrollTop + navbarHeight;
      }
      
      var shouldBeVisible   = (scrollTop > offsetTop) && (scrollTop < offsetTop + that.$table.height());

      if(useFixedSolution) {
          that.$stickyTableHead.scrollLeft(that.$tableScrollWrapper.scrollLeft());

          //add fixedSolution class
          that.$stickyTableHead.addClass('fixed-solution');
          
          // Calculate top property value (-1 to accomodate for top border)
          top = navbarHeight - 1;
          
          // When the about to scroll past the table, move sticky table head up
          if(((scrollTop - offsetTop) > maxTop)){
              top -= ((scrollTop - offsetTop) - maxTop);
              that.$stickyTableHead.addClass('border-radius-fix');
          } else {
              that.$stickyTableHead.removeClass('border-radius-fix');
          }
          
          if (shouldBeVisible) {
              //show sticky table head and update top and width.
              that.$stickyTableHead.css({ "visibility": "visible", "top": top + "px", "width": that.$tableScrollWrapper.innerWidth() + "px"});
              
              //no more stuff to do - return!
              return;
          } else {
            //hide sticky table head and reset width
            that.$stickyTableHead.css({"visibility": "hidden", "width": "auto" });
         }
          
      } else { // alternate method
          //remove fixedSolution class
          that.$stickyTableHead.removeClass('fixed-solution');
          
          //animation duration
          var animationDuration = 400;
          
          // Calculate top property value (-1 to accomodate for top border)
          top = scrollTop - offsetTop - 1;

          // Make sure the sticky header doesn't slide up/down too far.
          if(top < 0) {
            top = 0;
          } else if (top > maxTop) {
            top = maxTop;
          }

          // Accomandate for rubber band effect
          if(rubberBandOffset > 0) {
            top = top - rubberBandOffset;
          }

          if (shouldBeVisible) {
              //show sticky table head (the clone) (animate repositioning)
              that.$stickyTableHead.css({ "visibility": "visible" });
              that.$stickyTableHead.animate({ "top": top + "px" }, animationDuration);

              // hide original table head
              that.$thead.css({ "visibility": "hidden" });

          } else {

              that.$stickyTableHead.animate({ "top": "0" }, animationDuration, function(){
                // show original table head
                that.$thead.css({ "visibility": "visible" });

                // hide sticky table head (the clone)
                that.$stickyTableHead.css({ "visibility": "hidden" });
              });
          }
      }
  };
    
  // Setup header cells
  ResponsiveTable.prototype.setupHdrCells = function() {
      var that = this;

      // for each header column
      that.$hdrCells.each(function(i){
        var $th = $(this),
            id = $th.attr("id"),
            thText = $th.text();
         
        // assign an id to each header, if none is in the markup
        if (!id) {
          id = that.idPrefix + i;
          $th.attr("id", id);
        }

        if(thText === "" || $th.attr("data-col-name")){
          thText = $th.attr("data-col-name");
        }
         
        // create the hide/show toggle for the current column
        if ( $th.is("[data-priority]") ) {
          var $toggle = $('<li class="checkbox-row"><input type="checkbox" name="toggle-'+id+'" id="toggle-'+id+'" value="'+id+'" /> <label for="toggle-'+id+'">'+ thText +'</label></li>');
          var $checkbox = $toggle.find("input");
           
          that.$dropdownContainer.append($toggle);

          $toggle.click(function(){
            // console.log("cliiiick!");
            $checkbox.prop("checked", !$checkbox.prop("checked"));
            $checkbox.trigger("change");
          });
            
         //Freakin' IE fix
          if ($('html').hasClass('lt-ie9')) {
            $checkbox.click(function() {
              $(this).trigger("change");
            });
          }

          $toggle.find("label").click(function(event){
            event.stopPropagation();
          });
           
          $toggle.find("input")
            .click(function(event){
              event.stopPropagation();
            })
            .change(function(){ // bind change event on checkbox
//                console.log('cccchange');
                
                var $checkbox = $(this),
                    val = $checkbox.val(),
                    //all cells under the column, including the header and its clone
                    $cells = that.$tableScrollWrapper.find("#" + val + ", #" + val + "-clone, [data-columns~="+ val +"]");

                //if display-all is on - save state and carry on
                if(that.$table.hasClass('display-all')){
                    //save state
                    $.proxy(that.preserveShowAll(), that);
                    //remove display all class
                    that.$table.removeClass('display-all');
                    that.$tableClone.removeClass('display-all');
                    //switch off button
                    that.$displayAllBtn.removeClass('btn-primary');
                }

                // loop through the cells
                $cells.each(function(){
                  var $cell = $(this);

                  // is the checkbox checked now?
                  if ($checkbox.is(":checked")) {

                    // if the cell was already visible, it means its original colspan was >1
                    // so let's increment the colspan
                    if($cell.css('display') !== 'none'){
                      $cell.prop('colSpan', parseInt($cell.prop('colSpan')) + 1);
                    }

                    // show cell
                    $cell.show();

                  }
                  // checkbox has been unchecked
                  else {
                      // decrement colSpan if it's not 1 (because colSpan should not be 0)
                      if(parseInt($cell.prop('colSpan'))>1){
                        $cell.prop('colSpan', parseInt($cell.prop('colSpan')) - 1);
                      }
                      // otherwise, hide the cell
                      else {
                        $cell.hide();
                      }
                  }
                });
            })
            .bind("updateCheck", function(){
                if ( $th.css('display') !== 'none') {
                  $(this).prop("checked", true);
                }
                else {
                  $(this).prop("checked", false);
                }
            })
            .trigger("updateCheck");
        } // end if
      }); // end hdrCells loop 
  };
    
  // Setup standard cells
  // assign matching "data-columns" attributes to the associated cells "(cells with colspan>1 has multiple columns).
  ResponsiveTable.prototype.setupStandardCells = function() {
      var that = this;
      
      // for each body rows
      that.$bodyRows.each(function(){
        var idStart = 0;

        // for each cell
        $(this).find("th, td").each(function(){
          var $cell = $(this);
          var columnsAttr = "";

          var colSpan = $cell.prop("colSpan");

          // if colSpan is more than 1, give it the class 'spn-cell';
          if(colSpan > 1) {
            $cell.addClass('spn-cell');
          }

          var numOfHidden = 0;
          // loop through columns that the cell spans over
          for (var k = idStart; k < (idStart + colSpan); k++) {
            // add column id
            columnsAttr = columnsAttr + " " + that.idPrefix + k;

            // get colulm header
            var $colHdr = that.$tableScrollWrapper.find('#' + that.idPrefix + k);

            // copy class attribute from column header
            var classes = $colHdr.attr("class");
            if (that.options.copyClasses) {
              $cell.addClass(classes);
            }

            // copy data-priority attribute from column header
            var dataPriority = $colHdr.attr("data-priority");
            if (dataPriority) { $cell.attr("data-priority", dataPriority); }

            if($colHdr.css('display')==='none'){
              numOfHidden++;
            }

          }

          //update colSpan to match number of visible columns that i belongs to
          $cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));

          //remove whitespace in begining of string.
          columnsAttr = columnsAttr.substring(1);

          //set attribute to cell
          $cell.attr("data-columns", columnsAttr);

          //increment idStart with the current cells colSpan.
          idStart = idStart + colSpan;
        });
      });
  };
    
  // Update colspan and visibility of spanning cells
  ResponsiveTable.prototype.updateSpanningCells = function() {
      var that = this;
      
      // iterate through cells with class 'spn-cell'
      that.$table.find('.spn-cell').each( function(){
        var $cell = $(this);
        var columnsAttr = $cell.attr("data-columns").split(" ");

        var colSpan = columnsAttr.length;
        var numOfHidden = 0;
        for (var i = 0; i < colSpan; i++) {
          if($('#' + columnsAttr[i]).css('display')==='none'){
            numOfHidden++;
          }
        }

        // if one of the columns that the cell belongs to is visible then show the cell
        if(numOfHidden !== colSpan){
          $cell.show();
        } else {
           $cell.hide(); //just in case
        }

        // console.log('numOfHidden: ' + numOfHidden);
        // console.log("new colSpan:" +Math.max((colSpan - numOfHidden),1));

        //update colSpan to match number of visible columns that i belongs to
        $cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));
      });
  };

  //Add height to table-responsive class so dropdowns in tables don't get cut off
  ResponsiveTable.prototype.dropdownInTables = function() {
    var alreadyRan = false;

    function calcHeightOfTable(){
      //Make sure this doesn't run more than once on page load.
      if (alreadyRan === false){
        var table_height = $(".table-responsive").height();
        //Get the height of the last dropdown in the table.
        var dropdown_height = $(".table-responsive").find(".dropdown-menu:last-child").height();
        if (table_height < 150){
          //Add the height of the last table to .table-responsive
          var added_table_height = table_height + dropdown_height;
          $(".table-responsive").css("height", added_table_height);
          alreadyRan = true;
        }
      }
    }

    $(".table-responsive").find(".dropdown-toggle").click(function(){
      calcHeightOfTable();
    });
  };

  // RESPONSIVE TABLE PLUGIN DEFINITION
  // ===========================

  var old = $.fn.responsiveTable;

  $.fn.responsiveTable = function (option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('responsiveTable');
      var options = $.extend({}, ResponsiveTable.DEFAULTS, $this.data(), typeof option === 'object' && option);

      if (!data) {
          $this.data('responsiveTable', (data = new ResponsiveTable(this, options)));
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

  $(window).on('load.responsiveTable.data-api', function () {
    $('table[data-complex="true"]').each(function () {
      var $table = $(this);
      $table.addClass('table-complex');
      $table.responsiveTable($table.data());
    });
  });


})(jQuery);


// DROPDOWN
// ==========================

// Prevent dropdown from closing when toggling checkbox
$(document).on('click.dropdown.data-api', '.dropdown-menu .checkbox-row', function (e) {
  e.stopPropagation();
});

// FEATURE DETECTION (instead of Modernizr)
// ==========================

// media queries
function mediaQueriesSupported() {
    return (typeof window.matchMedia !== "undefined" || typeof window.msMatchMedia !== "undefined" || typeof window.styleMedia !== "undefined");
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
