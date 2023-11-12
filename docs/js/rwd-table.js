/*!
 * Responsive Tables v6.1.3 (http://gergeo.se/RWD-Table-Patterns)
 * This is an awesome solution for responsive tables with complex data.
 * Authors: Nadan Gergeo <nadan@blimp.se> (www.blimp.se), Lucas Wiener <lucas@blimp.se> & "Maggie Wachs (www.filamentgroup.com)"
 * Licensed under MIT (https://github.com/nadangergeo/RWD-Table-Patterns/blob/master/LICENSE-MIT)
 */
(function ($) {
    'use strict';

    // RESPONSIVE TABLE CLASS DEFINITION
    // ==========================

    var ResponsiveTable = function(element, options) {
        // console.time('init');

        var that = this;

        this.options = options;
        this.$tableWrapper = null; //defined later in wrapTable
        this.$tableScrollWrapper = $(element); //defined later in wrapTable
        this.$table = $(element).find('table');

        if(this.$table.length !== 1) {
            throw new Error('Exactly one table is expected in a .table-responsive div.');
        }

        //apply pattern option as data-attribute, in case it was set via js
        this.$tableScrollWrapper.attr('data-pattern', this.options.pattern);

        //if the table doesn't have a unique id, give it one.
        //The id will be a random hexadecimal value, prefixed with id.
        //Used for triggers with displayAll button.
        this.id = this.$table.prop('id') || this.$tableScrollWrapper.prop('id') || 'id' + Math.random().toString(16).slice(2);

        this.$tableClone = null; //defined farther down
        this.$stickyTableHeader = null; //defined farther down

        //good to have - for easy access
        this.$thead = this.$table.find('thead');
        this.$hdrRows = this.$thead.find("tr");
        this.$hdrCells = this.$hdrRows.first().find('th'); // use first row as basis
        this.$tbody = this.$table.find('tbody');
        this.$bodyRows = this.$tbody.find('tr');
        this.$footRows = this.$table.find('tfoot').find('tr');
        this.$bodyAndFootRows = $.merge(this.$bodyRows, this.$footRows); // combine tbody and tfoot rows

        //toolbar and buttons
        this.$btnToolbar = null; //defined farther down
        this.$dropdownGroup = null; //defined farther down
        this.$dropdownBtn = null; //defined farther down
        this.$dropdownContainer = null; //defined farther down

        this.$displayAllBtn = null; //defined farther down

        this.$focusGroup = null; //defined farther down
        this.$focusBtn = null; //defined farther down

        //misc
        this.displayAllTrigger = 'display-all-' + this.id + '.responsive-table';
        this.idPrefix = this.id + '-col-';

        this.headerColIndices = {};
        this.headerRowIndices = {};

        this.displayValue = 'table-cell';
        if($('html').hasClass('lt-ie9')){
            this.displayValue = 'inline';
        }

        // Setup table
        // -------------------------

        //wrap table
        this.wrapTable();

        //create toolbar with buttons
        this.createButtonToolbar();

        //Build header indices mapping (for colspans in header)
        this.buildHeaderCellIndices();

        // Setup cells
        // -------------------------

        //setup header
        this.setupTableHeader();

        //setup standard cells
        this.setupBodyAndFootRows();

        //create sticky table head
        if(this.options.stickyTableHeader){
            this.createStickyTableHeader();
        }

        // hide toggle button if the list is empty
        if(this.$dropdownContainer.is(':empty')){
            this.$dropdownGroup.hide();
        }

        // Event binding
        // -------------------------

        // bind click on rows
        this.bindClickOnRows();

        if(this.options.sortable) {
            //apply pattern option as data-attribute, in case it was set via js
            this.$tableScrollWrapper.attr('data-sortable', true);
            //needed for the css. Makes sure that sorting is actually active before applying styles.
            this.$tableScrollWrapper.attr('data-sorting-active', true);
            // bind click on theads with sorting function
            this.makeSortableByColumns();

            // for alternate toggling of sort direction
            this.shiftKeyActive = false;
            // listen on keydown/up and update shiftKeyActive
            $(document).on('keydown keyup', function(event) {
                that.shiftKeyActive = event.shiftKey;
            });
        }

        // on orientchange, resize and displayAllBtn-click
        $(window).bind('orientationchange resize ' + this.displayAllTrigger, function(){

            //update the inputs' checked status
            that.$dropdownContainer.find('input').trigger('updateCheck');

            //update colspan and visibility of spanning cells
            $.proxy(that.updateSpanningCells(), that);

        }).trigger('resize');

        // console.timeEnd('init');
    };

    ResponsiveTable.DEFAULTS = {
        pattern: 'priority-columns',
        stickyTableHeader: true,
        fixedNavbar: '.navbar.fixed-top',  // Is there a fixed navbar? The stickyTableHeader needs to know about it!
        addDisplayAllBtn: true, // should it have a display-all button?
        addFocusBtn: true,  // should it have a focus button?
        focusBtnIcon: 'fa fa-crosshairs',
        mainContainer: window,
        sortable: false,
        compareFunction: function(a, b, dir) {
            return a[0].localeCompare(b[0], undefined, { numeric: true }) < 0 ? -dir : dir;
        },
        i18n: {
            focus     : 'Focus',
            display   : 'Display',
            displayAll: 'Display all'
        }
    };

    // Wrap table
    ResponsiveTable.prototype.wrapTable = function() {
        this.$tableScrollWrapper.wrap('<div class="table-wrapper"/>');
        this.$tableWrapper = this.$tableScrollWrapper.parent();
    };

    ResponsiveTable.prototype.bindClickOnRows = function() {
        var that = this;

        if(this.options.addFocusBtn) {
            this.$bodyAndFootRows.unbind('click'); // remove old event listeners
            this.$bodyAndFootRows.click(function() {
                that.focusOnRow($(this));
            });
        }
    }

    // Create toolbar with buttons
    ResponsiveTable.prototype.createButtonToolbar = function() {
        var that = this;

        this.$btnToolbar = $('[data-responsive-table-toolbar="' + this.id + '"]');
        this.$btnToolbar.addClass('btn-toolbar justify-content-between');
        if(this.$btnToolbar.length === 0) {
          this.$btnToolbar = $('<div class="btn-toolbar justify-content-between" />');
        }

        this.$dropdownGroup = $('<div class="btn-group dropdown-btn-group dropdown" />');
        this.$dropdownBtn = $('<button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle" id="displayMenu' + this.id + '" data-bs-toggle="dropdown" aria-expanded="false">' + this.options.i18n.display + ' <span class="caret"></span></button>');
        this.$dropdownContainer = $('<ul class="dropdown-menu" aria-labelledby="displayMenu' + this.id + '"/>');

        // Focus btn
        if(this.options.addFocusBtn) {
            // Create focus btn group
            this.$focusGroup = $('<div class="btn-group focus-btn-group" />');

            // Create focus btn
            this.$focusBtn = $('<button type="button" class="btn btn-sm btn-outline-primary">' + this.options.i18n.focus + '</button>');

            if(this.options.focusBtnIcon) {
                this.$focusBtn.prepend('<span class="' + this.options.focusBtnIcon + '"></span> ');
            }

            // Add btn to group
            this.$focusGroup.append(this.$focusBtn);
            // Add focus btn to toolbar
            this.$btnToolbar.append(this.$focusGroup);

            // bind click on focus btn
            this.$focusBtn.click(function(){
                that.activateFocus();
            });
        } else {
            this.$btnToolbar.append($('<div />')); //add empty div instead, keeping same layout
        }

         // Display-all btn
        if(this.options.addDisplayAllBtn) {
            // Create display-all btn
            this.$displayAllBtn = $('<button type="button" class="btn btn-sm btn-outline-primary">' + this.options.i18n.displayAll + '</button>');
            // Add display-all btn to dropdown-btn-group
            this.$dropdownGroup.append(this.$displayAllBtn);

            if (this.$table.hasClass('display-all')) {
                // add 'btn-primary' class to btn to indicate that display all is activated
                this.$displayAllBtn.addClass('btn-primary');
            }

            // bind click on display-all btn
            this.$displayAllBtn.click(function(){
                $.proxy(that.displayAll(null, true), that);
            });
        }

        //add dropdown btn and menu to dropdown-btn-group
        this.$dropdownGroup.append(this.$dropdownBtn).append(this.$dropdownContainer);

        //add dropdown group to toolbar
        this.$btnToolbar.append(this.$dropdownGroup);

        // add toolbar above table
        this.$tableScrollWrapper.before(this.$btnToolbar);
    };

    ResponsiveTable.prototype.clearAllFocus = function() {
        this.$bodyAndFootRows.removeClass('unfocused');
        this.$bodyAndFootRows.removeClass('focused');
    };

    ResponsiveTable.prototype.activateFocus = function() {
        // clear all
        this.clearAllFocus();

        if(this.$focusBtn){
            this.$focusBtn.toggleClass('btn-primary');
        }

        this.$table.toggleClass('focus-on');
    };

    ResponsiveTable.prototype.focusOnRow = function(row) {
        // only if activated (.i.e the table has the class focus-on)
        if(this.$table.hasClass('focus-on')) {
            var alreadyFocused = $(row).hasClass('focused');

            // clear all
            this.clearAllFocus();

            if(!alreadyFocused) {
                this.$bodyAndFootRows.addClass('unfocused');
                $(row).addClass('focused');
            }
        }
    };

    /**
     * @param activate Forces the displayAll to be active or not. If anything else than bool, it will not force the state so it will toggle as normal.
     * @param trigger Bool to indicate if the displayAllTrigger should be triggered.
     */
    ResponsiveTable.prototype.displayAll = function(activate, trigger) {
        if(this.$displayAllBtn){
            // add 'btn-primary' class to btn to indicate that display all is activated
            this.$displayAllBtn.toggleClass('btn-primary', activate);
        }

        this.$table.toggleClass('display-all', activate);
        if(this.$tableClone){
            this.$tableClone.toggleClass('display-all', activate);
        }

        if(trigger) {
            $(window).trigger(this.displayAllTrigger);
        }
    };

    ResponsiveTable.prototype.preserveDisplayAll = function() {
        $(this.$table).find('th, td').css('display', this.displayValue);
        if(this.$tableClone){
            $(this.$tableClone).find('th, td').css('display', this.displayValue);
        }
    };

    ResponsiveTable.prototype.createStickyTableHeader = function() {
        var that = this;

        //clone table head
        that.$tableClone = that.$table.clone();

        //replace ids
        that.$tableClone.prop('id', this.id + '-clone');
        that.$tableClone.find('[id]').each(function() {
            $(this).prop('id', $(this).prop('id') + '-clone');
        });

        // wrap table clone (this is our "sticky table header" now)
        that.$tableClone.wrap('<div class="sticky-table-header"/>');
        that.$stickyTableHeader = that.$tableClone.parent();

        // give the sticky table header same height as original
        that.$stickyTableHeader.css('height', that.$thead.height() + 2);

        //insert sticky table header
        that.$table.before(that.$stickyTableHeader);

        // bind scroll on mainContainer with updateStickyTableHeader
        $(this.options.mainContainer).on('scroll', function(event){
            that.updateStickyTableHeader();
        });

        // bind resize on window with updateStickyTableHeader
        $(window).on('resize', function(event){
            that.updateStickyTableHeader();
        });

        $(that.$tableScrollWrapper).on('scroll', function(event){
            that.updateStickyTableHeader();
        });

        // determine what solution to use for rendereing  sticky table head (aboslute/fixed).
        that.useFixedSolution  = !isIOS() || (getIOSVersion() >= 8);
        //add class for rendering solution
        if(that.useFixedSolution) {
            that.$tableScrollWrapper.addClass('fixed-solution');
        } else {
            that.$tableScrollWrapper.addClass('absolute-solution');
        }
    };

    // Help function for sticky table header
    ResponsiveTable.prototype.updateStickyTableHeader = function() {
        var that              = this,
          top               = 0,
          offsetTop         = that.$table.offset().top,
          scrollTop         = $(this.options.mainContainer).scrollTop() -1, //-1 to accomodate for top border
          maxTop            = that.$table.height() - that.$stickyTableHeader.height(),
          rubberBandOffset  = (scrollTop + $(this.options.mainContainer).height()) - $(document).height(),
          navbarHeight      = 0;

        //Is there a fixed navbar?
        if($(that.options.fixedNavbar).length) {
            var $navbar = $(that.options.fixedNavbar).first();
            navbarHeight = $navbar.outerHeight();
            scrollTop = scrollTop + navbarHeight;
        }

        var shouldBeVisible;

        if(this.options.mainContainer === window) {
            shouldBeVisible   = (scrollTop > offsetTop) && (scrollTop < offsetTop + that.$table.height());
        } else {
            shouldBeVisible   = (offsetTop <= 0) && (-offsetTop < that.$table.height());
        }

        // console.log('offsetTop:' + offsetTop);
        // console.log('scrollTop:' + scrollTop);
        // console.log('tableHeight:' + that.$table.height());
        // console.log('shouldBeVisible:' + shouldBeVisible);

        if(that.useFixedSolution) { //fixed solution
            that.$stickyTableHeader.scrollLeft(that.$tableScrollWrapper.scrollLeft());

            // Calculate top property value (-1 to accomodate for top border)
            top = navbarHeight - 1;

            // When the user is about to scroll past the table, move sticky table head up
            if(this.options.mainContainer === window && ((scrollTop - offsetTop) > maxTop)){

                top -= ((scrollTop - offsetTop) - maxTop);
                that.$stickyTableHeader.addClass('border-radius-fix');

            } else if(this.options.mainContainer !== window && ((- offsetTop) > maxTop)){

                top -= ((- offsetTop) - maxTop);
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
            //animation duration
            var animationDuration = 400;

            // Calculate top property value (-1 to accomodate for top border)
            if(this.options.mainContainer === window) {
                top = scrollTop - offsetTop - 1;
            } else {
                top = -offsetTop - 1;
                // console.log('top:' + top);
            }

            // Make sure the sticky table header doesn't slide up/down too far.
            if(top < 0) {
                top = 0;
            } else if (top > maxTop) {
                top = maxTop;
            }

            // Accomandate for rubber band effect
            if(this.options.mainContainer === window) {
                if(rubberBandOffset > 0) {
                    top = top - rubberBandOffset;
                }
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
    ResponsiveTable.prototype.setupTableHeader = function() {
        var that = this;

        var colSpans = 0;

        // for each header column
        that.$hdrCells.each(function(i){
            var $th = $(this),
                id = $th.prop('id'),
                thText = $th.text();

            // assign an id to each header, if none is in the markup
            if (!id) {
                id = that.idPrefix + i;
                $th.prop('id', id);
            }

            if(thText === ''){
                thText = $th.attr('data-col-name');
            }

            // add x pos (used for sorting)
            $th.attr('data-pos-x', i + colSpans);
            
            // take account for colspans
            var colSpan = parseInt($th.prop('colSpan'));
            if(colSpan > 1) {
                colSpans += (colSpan - 1);
            }

            // create the hide/show toggle for the current column
            if ( $th.is('[data-priority]') && $th.data('priority') !== -1 ) {
                var $toggle = $('<li class="checkbox-row"><input type="checkbox" name="toggle-'+id+'" id="toggle-'+id+'" value="'+id+'" /> <label for="toggle-'+id+'">'+ thText +'</label></li>');
                var $checkbox = $toggle.find('input');

                that.$dropdownContainer.append($toggle);

                $toggle.click(function(event){
                    event.stopPropagation();
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
                    var $checkbox = $(this),
                        val = $checkbox.val(),
                        //all cells under the column, including the header and its clone
                        $cells = that.$tableWrapper.find('#' + val + ', #' + val + '-clone, [data-columns~='+ val +']');

                    //if display-all is on - save state and carry on
                    if(that.$table.hasClass('display-all')){
                        //save state
                        $.proxy(that.preserveDisplayAll(), that);
                        //remove display all class
                        that.$table.removeClass('display-all');
                        if(that.$tableClone){
                            that.$tableClone.removeClass('display-all');
                        }
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
                            // This should not be done for th's in thead.
                            if(!$cell.closest("thead").length && $cell.css('display') !== 'none'){
                                // make sure new colspan value does not exceed original colspan value
                                var newColSpan = Math.min(parseInt($cell.prop('colSpan')) + 1, $cell.attr('data-org-colspan'));
                                // update colspan
                                $cell.prop('colSpan', newColSpan);
                            }

                            // show cell
                            // $cell.show();
                            $cell.css("display", that.displayValue);

                        }
                      // checkbox has been unchecked
                      else {
                            // decrement colSpan if it's not 1 (because colSpan should not be 0)
                            // This should not be done for th's in thead.
                            if(!$cell.closest("thead").length && parseInt($cell.prop('colSpan'))>1){
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
                });
            } // end if
        }); // end hdrCells loop

        if(!$.isEmptyObject(this.headerRowIndices)) {
            that.setupRow(this.$thead.find("tr:eq(1)"), this.headerRowIndices, 1);
        }

        // also give first row in thead an index
        this.$hdrRows.first().attr('data-pos-y', 0);
    };

    // Setup body rows
    // assign matching "data-columns" attributes to the associated cells "(cells with colspan>1 has multiple columns).
    ResponsiveTable.prototype.setupBodyAndFootRows = function() {
        var that = this;

        // get fresh lists
        that.$tbody = that.$table.find('tbody');
        that.$bodyRows = that.$tbody.find('tr');
        that.$footRows = that.$table.find('tfoot').find('tr');

        // for each body
        that.$bodyRows.each(function(index){
            that.setupRow($(this), that.headerColIndices, index);
        });

        // for each footer row
        that.$footRows.each(function(index){
            that.setupRow($(this), that.headerColIndices, index);
        });
    };

    ResponsiveTable.prototype.setupRow = function($row, indices, index) {
        var that = this;

        //check if it's already set up
        if($row.data('setup')){
            // don't do anything
            return;
        } else {
            $row.data('setup', true);
            $row.attr('data-pos-y', index);
        }

        var idStart = 0;

        // for each cell
        $row.find('th, td').each(function(i){
            var $cell = $(this);
            var columnsAttr = '';

            var colSpan = $cell.prop('colSpan');
            $cell.attr('data-org-colspan', colSpan);

            // if colSpan is more than 1
            if(colSpan > 1) {
                //give it the class 'spn-cell';
                $cell.addClass('spn-cell');
            }

            // loop through columns that the cell spans over
            for (var k = idStart; k < (idStart + colSpan); k++) {
                // add column id
                columnsAttr = columnsAttr + ' ' + that.idPrefix + indices[k];

                // get column header
                var $colHdr = that.$table.find('#' + that.idPrefix + indices[k]);

                // copy data-priority attribute from column header
                var dataPriority = $colHdr.attr('data-priority');
                if (dataPriority) { $cell.attr('data-priority', dataPriority); }
            }

            //remove whitespace in begining of string.
            columnsAttr = columnsAttr.substring(1);

            //set data-columns attribute to cell
            $cell.attr('data-columns', columnsAttr);

            // x-position (for sorting function)
            var rowSpansBeforeCell = 0;

            // Take account to rowspans if it is the seconds row in thead
            if($row.parent().prop('tagName') === 'THEAD' && $row.attr('data-pos-y') === "1" && that.rowspansBeforeIndex) {
                var rowSpansBeforeCell = that.rowspansBeforeIndex[i] || 0;
            }

            $cell.attr('data-pos-x', i + rowSpansBeforeCell);

            //increment idStart with the current cells colSpan.
            idStart = idStart + colSpan;
        });
    };

    ResponsiveTable.prototype.buildHeaderCellIndices = function() {
        var that = this;

        var rowspansBeforeIndex = {};

        this.headerColIndices = {};
        this.headerRowIndices = {};
        var colPadding = 0;
        var rowPadding = 0;

        this.$hdrCells.each(function(i){
            var $th = $(this);
            var colSpan = $th.prop('colSpan');
            var rowSpan = $th.prop("rowSpan");

            for(var index = 0; index < colSpan; index++) {
                that.headerColIndices[colPadding + i + index] = i;

                if(colPadding + i + index >= 0) {
                    rowspansBeforeIndex[colPadding + i + index - rowPadding] = rowPadding;
                }
            }

            if(rowSpan > 1) {
                rowPadding++;
            }

            colPadding += colSpan - 1;
        });

        if(this.$hdrRows.length === 2) {
            var $row = $(this.$hdrRows[1]);
            $row.find("th").each(function(cellIndex) {
                that.headerRowIndices[cellIndex] = that.headerColIndices[rowspansBeforeIndex[cellIndex] + cellIndex];
                that.rowspansBeforeIndex = rowspansBeforeIndex;
            });
        } else if(this.$hdrRows.length > 2) {
            throw new Error("This plugin doesnt support more than two rows in thead.");
        }
    }

    // Run this after the content in tbody has changed
    ResponsiveTable.prototype.update = function() {
        this.$bodyAndFootRows = this.$table.find('tbody, tfoot').find('tr'); // get fresh list
        this.setupBodyAndFootRows();
        this.bindClickOnRows();

        // Remove old tbody clone from Tableclone
        this.$tableClone.find('tbody, tfoot').remove();

        // Make new clone of tbody and tfoot
        var $tbodyClone = this.$bodyAndFootRows.clone();

        //replace ids
        $tbodyClone.find('[id]').each(function() {
            $(this).prop('id', $(this).prop('id') + '-clone');
        });

        // Append new clone to tableClone
        $tbodyClone.appendTo(this.$tableClone);

        // Make sure columns visibility is in sync,
        // by triggering a (non-changing) change event on all checkboxes
        this.$dropdownContainer.find('input').trigger('change');

        // ¯\(°_o)/¯ I dunno if this is needed
        // this.updateSpanningCells();
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
                // $cell.show();
                $cell.css("display", that.displayValue);
            } else {
                $cell.hide(); //just in case
            }

            // console.log('numOfHidden: ' + numOfHidden);
            // console.log("new colSpan:" +Math.max((colSpan - numOfHidden),1));

            //update colSpan to match number of visible columns that i belongs to
            $cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));
        });
    };

    // Utils for sorting

    ResponsiveTable.prototype.getSortedColumn = function(col, dir) {
        var that = this;
        
        for (var i = 0; i < col.length; i++) {
            col[i] = [col[i], i];
        }

        var compareFunction;
        if(that.options.compareFunction instanceof Function) {
            compareFunction = function(a, b) {
                return that.options.compareFunction(a, b, dir);
            };
        }

        col.sort(compareFunction);

        col.indices = [];

        for (var j = 0; j < col.length; j++) {
            col.indices.push(col[j][1]);
            col[j] = col[j][0];
        }

        return col;
    };

    ResponsiveTable.prototype.getRestoredColumn = function(col) {
        for (var i = 0; i < col.length; i++) {
            col[i] = [col[i], i, $(col[i]).attr("data-pos-y")];
        }

        col.sort(function(a, b) {
            return a[2].localeCompare(b[2], undefined, { numeric: true }) < 0 ? -1 : 1;
        });

        col.indices = [];

        for (var j = 0; j < col.length; j++) {
            col.indices.push(col[j][1]);
            col[j] = col[j][0];
        }

        return col;
    };

    var sortDirMapping = {
        "asc": 1,
        "desc": -1,
        "org": 0
    };

    ResponsiveTable.prototype.sortColumn = function(hdr, dir) {
        var that = this;
        var $tBody = that.$tbody;

        // if hdr is an number (index), treat as pos-x and use it to get hdr. Otherwise expecting hdr element directly (sent via click-event).
        var $hdr = Number.isInteger(hdr) ? that.$thead.find('th[data-pos-x='+ hdr +']') : $(hdr);
        var id = $hdr.prop('id');
        var $clone = id.indexOf('-clone') === (id.length - 6) ? $('#' + id.slice(0, id.length - 6)) : $('#' + $(hdr).prop('id') + '-clone'); // the clone is the original if 'hdr' is the clone, and vice versa.

        // get fresh list of rows in tbody
        var $tBodyRows = $tBody.find('tr');

        // get all cells under the column
        var posX = $hdr.data('pos-x');
        var col = $tBodyRows.find('[data-pos-x='+ posX +']');

        var sorted = $hdr.attr("data-sorted");

        // get all hdr cells if not cached
        if(!that.$allHdrCells) {
            that.$hdrCellsClones = that.$tableClone ? that.$tableClone.find('thead > tr > th') : [];
            that.$allHdrCells = $.merge(this.$hdrRows.find('th'), that.$hdrCellsClones);
        }

        // remove sorted attr from all cols
        that.$allHdrCells.filter("[data-sorted]").each(function() {
            $(this).removeAttr("data-sorted");
        });

        var sortDir;

        if((that.shiftKeyActive && sorted === "desc") || (!sorted && !that.shiftKeyActive) || dir === 1) {
            // add attr to clicked col
            $hdr.attr("data-sorted", "asc");
            // do same on clone (sticky)
            $clone.attr("data-sorted", "asc");
            sortDir = 1;
        } else if((that.shiftKeyActive && !sorted) || (sorted === "asc" && !that.shiftKeyActive) || dir === -1) {
            // switch to desc order
            $hdr.attr("data-sorted", "desc");
            // do same on clone (sticky)
            $clone.attr("data-sorted", "desc");
            sortDir = -1;
        } else if((that.shiftKeyActive && sorted === "asc") || (sorted === "desc" && !that.shiftKeyActive) || dir === 0) {
            // remove
            $hdr.removeAttr("data-sorted");
            // do same on clone (sticky)
            $clone.removeAttr("data-sorted");
            sortDir = 0;
        }

        if(sortDir !== 0){
            col = col.map(function(i, e) {
                // prepare for sorting by just keeping the inner text
                return $(e).attr('data-value') || e.innerText;
            }).get();

            // sort
            col = that.getSortedColumn(col, sortDir);
        } else {
            // restore original order
            col = that.getRestoredColumn($tBodyRows.get())
        }

        // Now that we have the new order indexes, modify dom into that order.
        // This is definetely not the fastest method, but it was the easiest to implement for now.
        // Todo: optimize by detatching and appending (moving) rows, instead of cloning and deleting.
        for (var i = 0; i < col.length; i++) {
            $tBodyRows.eq(col.indices[i]).clone().appendTo($tBody); // add copy to end
        }

        for (var i = 0; i < col.length; i++) {
            $tBodyRows.eq(i).remove(); // remove old copies at top (unsorted original)
        }

        that.$bodyAndFootRows = that.$table.find('tbody, tfoot').find('tr'); // get fresh list
        that.bindClickOnRows(); // add click events (focus)
    }

    ResponsiveTable.prototype.makeSortableByColumns = function() {
        var that = this;
        that.$hdrCellsClones = that.$tableClone ? that.$tableClone.find('thead > tr > th') : [];
        that.$allHdrCells = $.merge(this.$hdrRows.find('th'), that.$hdrCellsClones);
        
        that.$allHdrCells.each(function(colIndex){
            if($(this).prop('colSpan') > 1) {
                return;
            }
            
            $(this).click(function() {
                that.sortColumn(this);
            });
        });
    };

    // RESPONSIVE TABLE PLUGIN DEFINITION
    // ===========================

    var old = $.fn.responsiveTable;

    $.fn.responsiveTable = function (option, args) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('responsiveTable');
            var options = $.extend({}, ResponsiveTable.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if(options.pattern === '') {
                return;
            }

            if (!data) {
                $this.data('responsiveTable', (data = new ResponsiveTable(this, options)));
            }
            if (typeof option === 'string') {
                data[option].apply(data, args);
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

    $(document).on('ready.responsive-table.data-api', function () {
        $('.table-responsive[data-pattern]').each(function () {
            var $tableScrollWrapper = $(this);
            $tableScrollWrapper.responsiveTable($tableScrollWrapper.data());
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

    // Checks if current browser is on IOS.
    function isIOS() {
        return !!(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i));
    }

    // Gets iOS version number. If the user is not on iOS, the function returns 0.
    function getIOSVersion() {
        if(isIOS()){
            var iphone_version = parseFloat(('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', ''));
            return iphone_version;
        } else {
            return 0;
        }
    }

    $(document).ready(function() {
        // Change `no-js` to `js`
        $('html').removeClass('no-js').addClass('js');

        // Add mq/no-mq class to html
        if(mediaQueriesSupported()) {
            $('html').addClass('mq');
        } else {
            $('html').addClass('no-mq');
        }

        // Add touch/no-touch class to html
        if(hasTouch()) {
            $('html').addClass('touch');
        } else {
            $('html').addClass('no-touch');
        }
    });
})(jQuery);
