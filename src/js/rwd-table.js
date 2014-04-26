(function ($) {
    'use strict';

    // RESPONSIVE TABLE CLASS DEFINITION
    // ==========================

    var ResponsiveTable = function(element, options) {
        var that = this;

        this.options = options;
        this.$table = $(element);

        //if the table doesn't have a unique id, give it one.
        if(!this.$table.attr('id')) {
            var uid = 'id' + Math.random().toString(16).slice(2);
            this.$table.attr('id', uid);
        }

        this.$tableWrapper = null; //defined later in wrapTable
        this.$tableScrollWrapper = null; //defined later in wrapTable

        this.$tableClone = null; //defined farther down
        this.$stickyTableHeader = null; //defined farther down

        //good to have - for easy access
        this.$thead = this.$table.find('thead');
        this.$tbody = this.$table.find('tbody');
        this.$hdrCells = this.$thead.find('th');
        this.$bodyRows = this.$tbody.find('tr');

        //toolbar and buttons
        this.$btnToolbar = null; //defined farther down
        this.$dropdownGroup = null; //defined farther down
        this.$dropdownBtn = null; //defined farther down
        this.$dropdownContainer = null; //defined farther down

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

        //create toolbar with buttons
        $.proxy(this.createButtonToolbar(), this);

        if(this.options.displayAll){
            //display all columns
            $.proxy(this.displayAll(true, false), this);
        }


        // Setup cells
        // -------------------------

        //setup header cells
        $.proxy(this.setupHdrCells(), this);

        //setup standard cells
        $.proxy(this.setupStandardCells(), this);

        //create sticky table head
        if(this.options.stickyTableHeader){
            $.proxy(this.createStickyTableHeader(), this);
        }

        // hide toggle button if the list is empty
        if(this.$dropdownContainer.is(':empty')){
            this.$dropdownGroup.hide();
        }


        // Event binding
        // -------------------------

        // on orientchange, resize and displayAllBtn-click
        $(window).bind('orientationchange resize ' + this.displayAllTrigger, function(){

            //update the inputs' checked status
            that.$dropdownContainer.find('input').trigger('updateCheck');

            //update colspan and visibility of spanning cells
            $.proxy(that.updateSpanningCells(), that);

        });

        // bind click on row
        this.$bodyRows.click(function(){
            $.proxy(that.focusOnRow($(this)), that);
        });
      
    };

    ResponsiveTable.DEFAULTS = {
        stickyTableHeader: true,
        fixedNavbar: '.navbar-fixed-top',  // Is there a fixed navbar? The stickyTableHeader needs to know about it!
        addDisplayAllBtn: true, // should it have a display-all button?
        addFocusBtn: true,  // should it have a focus button?
        focusBtnIcon: 'glyphicon glyphicon-screenshot',
        displayAll: false
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

        // Focus btn
        if(that.options.addFocusBtn) {
            // Create focus btn group
            that.$focusGroup = $('<div class="btn-group focus-btn-group" />');

            // Create focus btn
            that.$focusBtn = $('<button class="btn btn-default">Focus</button>');

            if(that.options.focusBtnIcon) {
                that.$focusBtn.prepend('<span class="' + that.options.focusBtnIcon + '"></span> ');
            }

            // Add btn to group
            that.$focusGroup.append(that.$focusBtn);
            // Add focus btn to toolbar
            that.$btnToolbar.append(that.$focusGroup);

            // bind click on focus btn
            that.$focusBtn.click(function(){
                $.proxy(that.activateFocus(), that);
            });
        }

         // Display-all btn
        if(that.options.addDisplayAllBtn) {
            // Create display-all btn
            that.$displayAllBtn = $('<button class="btn btn-default">Display all</button>');
            // Add display-all btn to dropdown-btn-group
            that.$dropdownGroup.append(that.$displayAllBtn);

            if (that.$table.hasClass('display-all')) {
                // add 'btn-primary' class to btn to indicate that display all is activated
                that.$displayAllBtn.addClass('btn-primary');
            }

            // bind click on display-all btn
            that.$displayAllBtn.click(function(){
                $.proxy(that.displayAll(true, true), that);
            });
        }

        //add dropdown btn and menu to dropdown-btn-group
        that.$dropdownGroup.append(that.$dropdownBtn).append(that.$dropdownContainer);

        //add dropdown group to toolbar
        that.$btnToolbar.append(that.$dropdownGroup);

        // add toolbar above table
        that.$tableScrollWrapper.before(that.$btnToolbar);
    };

    ResponsiveTable.prototype.clearAllFocus = function() {
        var that = this;

        that.$bodyRows.removeClass('unfocused');
        that.$bodyRows.removeClass('focused');
    };

    ResponsiveTable.prototype.activateFocus = function() {
        var that = this;

        // clear all
        that.clearAllFocus();

        if(that.$focusBtn){
            that.$focusBtn.toggleClass('btn-primary');
        }

        that.$table.toggleClass('focus-on');
    };

    ResponsiveTable.prototype.focusOnRow = function(row) {
        var that = this;

        // only if activated (.i.e the table has the class focus-on)
        if(that.$table.hasClass('focus-on')) {
            var alreadyFocused = $(row).hasClass('focused');

            // clear all
            this.clearAllFocus();

            if(!alreadyFocused) {
                that.$bodyRows.addClass('unfocused');
                $(row).addClass('focused');
            }
        }
    };

    ResponsiveTable.prototype.displayAll = function(activate, trigger) {
        var that = this;

        if(that.$displayAllBtn){
            // add 'btn-primary' class to btn to indicate that display all is activated
            that.$displayAllBtn.toggleClass('btn-primary', activate);
        }

        that.$table.toggleClass('display-all', activate);
        if(that.$tableClone){
            that.$tableClone.toggleClass('display-all', activate);
        }

        if(trigger) {
            $(window).trigger(that.displayAllTrigger);
        }
    };

    ResponsiveTable.prototype.preserveDisplayAll = function() {
        var that = this;

        var displayProp = 'table-cell';
        if($('html').hasClass('lt-ie9')){
            displayProp = 'inline';
        }

        $(that.$table).find('th, td').each(function(){
            $(this).css('display', displayProp);
        });
    };

    ResponsiveTable.prototype.createStickyTableHeader = function() {
        var that = this;

        //clone table head
        that.$tableClone = that.$table.clone();

        //replace ids
        that.$tableClone.attr('id', that.$table.attr('id') + '-clone');
        that.$tableClone.find('[id]').each(function() {
            $(this).attr('id', $(this).attr('id') + '-clone');
        });

        // wrap table clone (this is our "sticky table header" now)
        that.$tableClone.wrap('<div class="sticky-table-header"/>');
        that.$stickyTableHeader = that.$tableClone.parent();

        // give the sticky table header same height as original
        that.$stickyTableHeader.css('height', that.$thead.height() + 2);

        //insert sticky table header
        if($('html').hasClass('lt-ie10')){
            that.$tableScrollWrapper.closest('.container').prepend(that.$stickyTableHeader);
        } else {
            that.$table.before(that.$stickyTableHeader);
        }

        // var bodyRowsClone = $(tableClone).find('tbody').find('tr');

        // bind scroll and resize with updateStickyTableHeader
        $(window).bind('scroll resize', function(){
            $.proxy(that.updateStickyTableHeader(), that);
        });

        $(that.$tableScrollWrapper).bind('scroll', function(){
            $.proxy(that.updateStickyTableHeader(), that);
        });
    };

    // Help function for sticky table header
    ResponsiveTable.prototype.updateStickyTableHeader = function() {
        var that              = this,
          top               = 0,
          offsetTop         = that.$table.offset().top,
          scrollTop         = $(window).scrollTop() -1, //-1 to accomodate for top border
          maxTop            = that.$table.height() - that.$stickyTableHeader.height(),
          rubberBandOffset  = (scrollTop + $(window).height()) - $(document).height(),
        //          useFixedSolution  = that.$table.parent().prop('scrollWidth') === that.$table.parent().width();
          useFixedSolution  = !that.iOS,
          navbarHeight      = 0;

        //Is there a fixed navbar?
        if($(that.options.fixedNavbar).length) {
            var $navbar = $(that.options.fixedNavbar).first();
            navbarHeight = $navbar.height();
            scrollTop = scrollTop + navbarHeight;
        }

        var shouldBeVisible   = (scrollTop > offsetTop) && (scrollTop < offsetTop + that.$table.height());

        if(useFixedSolution) {
            that.$stickyTableHeader.scrollLeft(that.$tableScrollWrapper.scrollLeft());

            //add fixedSolution class
            that.$stickyTableHeader.addClass('fixed-solution');

            // Calculate top property value (-1 to accomodate for top border)
            top = navbarHeight - 1;

            // When the about to scroll past the table, move sticky table head up
            if(((scrollTop - offsetTop) > maxTop)){
                top -= ((scrollTop - offsetTop) - maxTop);
                that.$stickyTableHeader.addClass('border-radius-fix');
            } else {
                that.$stickyTableHeader.removeClass('border-radius-fix');
            }

            if (shouldBeVisible) {
                //show sticky table header and update top and width.
                that.$stickyTableHeader.css({ 'visibility': 'visible', 'top': top + 'px', 'width': that.$tableScrollWrapper.innerWidth() + 'px'});

                //no more stuff to do - return!
                return;
            } else {
                //hide sticky table header and reset width
                that.$stickyTableHeader.css({'visibility': 'hidden', 'width': 'auto' });
            }

        } else { // alternate method
            //remove fixedSolution class
            that.$stickyTableHeader.removeClass('fixed-solution');

            //animation duration
            var animationDuration = 400;

            // Calculate top property value (-1 to accomodate for top border)
            top = scrollTop - offsetTop - 1;

            // Make sure the sticky table header doesn't slide up/down too far.
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
                //show sticky table header (animate repositioning)
                that.$stickyTableHeader.css({ 'visibility': 'visible' });
                that.$stickyTableHeader.animate({ 'top': top + 'px' }, animationDuration);

                // hide original table head
                that.$thead.css({ 'visibility': 'hidden' });

            } else {

                that.$stickyTableHeader.animate({ 'top': '0' }, animationDuration, function(){
                    // show original table head
                    that.$thead.css({ 'visibility': 'visible' });

                    // hide sticky table head
                    that.$stickyTableHeader.css({ 'visibility': 'hidden' });
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
                id = $th.attr('id'),
                thText = $th.text();

            // assign an id to each header, if none is in the markup
            if (!id) {
                id = that.idPrefix + i;
                $th.attr('id', id);
            }

            if(thText === ''){
                thText = $th.attr('data-col-name');
            }

            // create the hide/show toggle for the current column
            if ( $th.is('[data-priority]') ) {
                var $toggle = $('<li class="checkbox-row"><input type="checkbox" name="toggle-'+id+'" id="toggle-'+id+'" value="'+id+'" /> <label for="toggle-'+id+'">'+ thText +'</label></li>');
                var $checkbox = $toggle.find('input');

                that.$dropdownContainer.append($toggle);

                $toggle.click(function(){
                    // console.log("cliiiick!");
                    $checkbox.prop('checked', !$checkbox.prop('checked'));
                    $checkbox.trigger('change');
                });

                //Freakin' IE fix
                if ($('html').hasClass('lt-ie9')) {
                    $checkbox.click(function() {
                        $(this).trigger('change');
                    });
                }

                $toggle.find('label').click(function(event){
                    event.stopPropagation();
                });

                $toggle.find('input')
                    .click(function(event){
                        event.stopPropagation();
                    })
                .change(function(){ // bind change event on checkbox
            //                console.log('cccchange');

                    var $checkbox = $(this),
                        val = $checkbox.val(),
                        //all cells under the column, including the header and its clone
                        $cells = that.$tableScrollWrapper.find('#' + val + ', #' + val + '-clone, [data-columns~='+ val +']');

                    //if display-all is on - save state and carry on
                    if(that.$table.hasClass('display-all')){
                        //save state
                        $.proxy(that.preserveDisplayAll(), that);
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
                        if ($checkbox.is(':checked')) {

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
                .bind('updateCheck', function(){
                    if ( $th.css('display') !== 'none') {
                        $(this).prop('checked', true);
                    }
                    else {
                        $(this).prop('checked', false);
                    }
                })
                .trigger('updateCheck');
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
            $(this).find('th, td').each(function(){
                var $cell = $(this);
                var columnsAttr = '';

                var colSpan = $cell.prop('colSpan');

                // if colSpan is more than 1, give it the class 'spn-cell';
                if(colSpan > 1) {
                    $cell.addClass('spn-cell');
                }

                var numOfHidden = 0;
                // loop through columns that the cell spans over
                for (var k = idStart; k < (idStart + colSpan); k++) {
                    // add column id
                    columnsAttr = columnsAttr + ' ' + that.idPrefix + k;

                    // get column header
                    var $colHdr = that.$tableScrollWrapper.find('#' + that.idPrefix + k);

                    // copy data-priority attribute from column header
                    var dataPriority = $colHdr.attr('data-priority');
                    if (dataPriority) { $cell.attr('data-priority', dataPriority); }

                    if($colHdr.css('display')==='none'){
                        numOfHidden++;
                    }

                }

                // if one of the columns that the cell belongs to is visible then show the cell
                if(numOfHidden !== colSpan){
                    $cell.show();
                } else {
                    $cell.hide(); //just in case
                }

                //update colSpan to match number of visible columns that i belongs to
                $cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));

                //remove whitespace in begining of string.
                columnsAttr = columnsAttr.substring(1);

                //set attribute to cell
                $cell.attr('data-columns', columnsAttr);

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
            var columnsAttr = $cell.attr('data-columns').split(' ');

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
        return (typeof window.matchMedia !== 'undefined' || typeof window.msMatchMedia !== 'undefined' || typeof window.styleMedia !== 'undefined');
    }

    // touch
    function hasTouch() {
        return 'ontouchstart' in window;
    }


    $(document).ready(function() {
        // Change `no-js` to `js`
        document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

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
})(jQuery);