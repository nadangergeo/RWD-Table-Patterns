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

  var ResponsiveTable = function(element, options) {
      this.options = options;
      this.$table = $(element);
      
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
      
      this.$autoGroup = null; //defined farther down
      this.$autoBtn = null; //defined farther down
      
      this.$focusGroup = null; //defined farther down
      this.$focusBtn = null; //defined farther down
      
      //misc
      this.autoHideTrigger = 'auto-on-' + this.$table.attr('id') + '.bs.responsivetable';
      this.idPrefix = this.$table.attr('id') + '-col-';
      this.scrollBuffer = 0;
      
      
      // Setup table
      // -------------------------
      
      //wrap table
      $.proxy(this.wrapTable(), this);

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
      
      
      // Window event binding
      // -------------------------
      
      // on orientchange, resize and autoBtn-click
      $(window).bind("orientationchange resize " + this.autoHideTrigger, function(){
        
        //update the inputs' checked status
        this.$dropdownContainer.find("input").trigger("updateCheck");
          
        //update colspan and visibility of spanning cells
        $.proxy(this.updateSpanningCells(), this);

      });
      
  };

  ResponsiveTable.DEFAULTS = {
    addautobtn: false, // should it have a auto button?
    addfocusbtn: false,  // should it have a focus button?
    fixednavbar: null  // Is there a fixed navbar? The stickyTableHead needs to know about it!
  };
    
  // Wrap table
  ResponsiveTable.prototype.wrapTable = function() {
      var that = this;
      
      // wrap table in div for scrolling if needed
      if(that.$table.parent().hasClass('table-scroll-wrapper') === false){
        // console.log('Wrapped table with scroll-wrapper');
        that.$table.wrap('<div class="table-scroll-wrapper"/>');
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
      
      that.$autoGroup = $('<div class="btn-group auto-btn-group" />');
      that.$autoBtn = $('<button class="btn btn-default">Auto</button>');
      
      if (that.$table.hasClass('auto-on')) {
        that.$autoBtn.addClass('btn-primary');
      }
      
      that.$focusGroup = $('<div class="btn-group focus-btn-group" />');
      that.$focusBtn = $('<button class="btn btn-default"><span class="glyphicon glyphicon-screenshot"></span> Focus</button>');

      //add focus btn to toolbar
      that.$focusGroup.append(that.$focusBtn);
      if(that.options.addfocusbtn) {
        that.$btnToolbar.append(that.$focusGroup);
      }
      
      //add auto btn to toolbar
      that.$autoGroup.append(that.$autoBtn);
      if(that.options.addautobtn) {
        that.$btnToolbar.append(that.$autoGroup);
      }
      
      //add dropdown btn toolbar
      that.$dropdownGroup.append(that.$dropdownBtn).append(that.$dropdownContainer);
      that.$btnToolbar.append(that.$dropdownGroup);
      
      // hide toggle button if the list is empty
      if(this.$dropdownContainer.is(":empty")){
        this.$dropdownGroup.hide();
      }

      // add toolbar above table
      that.$tableWrapper.prepend(that.$btnToolbar);
      
      
      // Bind events
      // -----------------------------------------------
      
      // Auto
      // -------------------------
      this.$autoBtn.click(function(){
          that.$autoBtn.toggleClass('btn-primary');
          that.$table.toggleClass('auto-on');
          that.$tableClone.toggleClass('auto-on');
          $(window).trigger(that.autoHideTrigger);
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
      that.$tableClone.wrap('<div class="stickyTableHead"/>');
      that.$stickyTableHead = that.$tableClone.parent();

      // give the sticky table head same height as original
      that.$stickyTableHead.css("height", that.$thead.height() + 2);

      //insert clone
      that.$table.before(that.$stickyTableHead);

      // var bodyRowsClone = $(tableClone).find('tbody').find('tr');

      // bind scroll and resize with updateStickyTableHead
      $(window).bind("scroll resize", function(){
          $.proxy(that.updateStickyTableHead(), that);
      });
  };
    
  // Setup header cells
  ResponsiveTable.prototype.setupHdrCells = function() {
      var that = this;
      
      // for each header column
      that.$hdrCells.each(function(i){
        var $th = $(this),
            id = $th.attr("id");
         
        // assign an id to each header, if none is in the markup
        if (!id) {
          id = that.idPrefix + i;
          $th.attr("id", id);
        }
         
        // create the hide/show toggle for the current column
        if ( $th.is("[data-priority]") ) {
          var $toggle = $('<li class="checkbox-row"><input type="checkbox" name="toggle-'+id+'" id="toggle-'+id+'" value="'+id+'" /> <label for="toggle-'+id+'">'+$th.text()+'</label></li>');
           
          that.$dropdownContainer.append($toggle);

          $toggle.click(function(){
            // console.log("cliiiick!");
            var $checkbox = $toggle.find("input");
            $checkbox.prop("checked", !$checkbox.prop("checked"));
            $checkbox.trigger("change");
          });

          $toggle.find("label").click(function(event){
            event.stopPropagation();
          });
           
          $toggle.find("input")
            .click(function(event){
              event.stopPropagation();
            })
            .change(function(){ // bind change event on checkbox
                var $checkbox = $(this),
                    val = $checkbox.val(),
                    //all cells under the column, including the header and its clone
                    $cells = that.$tableScrollWrapper.find("#" + val + ", #" + val + "-clone, [data-columns~="+ val +"]");

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
            if (classes) { $cell.addClass(classes); }

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
        }

        // console.log('numOfHidden: ' + numOfHidden);
        // console.log("new colSpan:" +Math.max((colSpan - numOfHidden),1));

        //update colSpan to match number of visible columns that i belongs to
        $cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));
      });
  };

  // Help function for sticky header
  ResponsiveTable.prototype.updateStickyTableHead = function() {
      var that           = this,
          offsetTop     = that.$table.offset().top,
          scrollTop     = $(window).scrollTop(),
          maxTop        = that.$table.height() - that.$stickyTableHead.height(),
          rubberBandOffset  = (scrollTop + $(window).height()) - $(document).height(),
          top           = 0;

      //Is there a fixed navbar?
      if(that.options.fixednavbar) {
        var $navbar = $(that.options.fixednavbar);
        scrollTop = scrollTop + $navbar.height();
        top = $navbar.height();
      }

      if(that.$table.parent().prop('scrollWidth') === that.$table.parent().width()) {
          if ((scrollTop > offsetTop) && (scrollTop < offsetTop + that.$table.height())) {
              //show sticky table head (the clone)
              that.$stickyTableHead.css({ "visibility": "visible", "position": "fixed", "top": top + "px", "width": that.$table.width() + "px", "min-width": "0" });
              return;
          }
      } else {
          //hide sticky table head and reset css
          that.$stickyTableHead.css({"visibility": "hidden", "position": "absolute", "width": "auto", "min-width": "100%" });
      }

      // Calculate top property value (-1 to accomodate for top border)
      top = scrollTop - offsetTop -1;

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

      // Check if iOS
      var iOS = false;
      if(
      (navigator.userAgent.match(/iPhone/i)) ||
      (navigator.userAgent.match(/iPad/i)) ||
      (navigator.userAgent.match(/iPod/i))
      ) {

        iOS = true;
      }

      if ((scrollTop > offsetTop) && (scrollTop < offsetTop + that.$table.height())) {
        if(!iOS){

          //show sticky table head (the clone)
          that.$stickyTableHead.css({ "visibility": "visible", "top": top + "px" });

        } else {

          //show sticky table head (the clone) (animate repositioning)
          that.$stickyTableHead.css({ "visibility": "visible" });
          that.$stickyTableHead.animate({ "top": top + "px" }, 400);

          // hide original table head
          that.$thead.css({ "visibility": "hidden" });
        }

      } else {
        if(!iOS){
          that.$stickyTableHead.css({ "visibility": "hidden" });
        } else {

          that.$stickyTableHead.animate({ "top": "0" }, 400, function(){
            // show original table head
            that.$thead.css({ "visibility": "visible" });

            // hide sticky table head (the clone)
            that.$stickyTableHead.css({ "visibility": "hidden" });
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
          $this.data('bs.responsivetable', (data = new ResponsiveTable(this, options)));
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