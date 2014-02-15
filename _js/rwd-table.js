/*	Scripts for the tables test page 
		Original author: Maggie Wachs, www.filamentgroup.com
		Author of extended script: Nadan Gergeo
		Date: November 2011
		Dependencies: jQuery, jQuery UI widget factory
*/

$(document).on('click.dropdown.data-api', '.dropdown-menu .checkbox-row', function (e) { e.stopPropagation(); });

// Help function for sticky header
function updateStickyTableHead(orgTable, stickyTableHead) {
	orgTable      = $(orgTable);
	var thead          = orgTable.find("thead"),
			offsetTop      = orgTable.offset().top,
			scrollTop      = $(window).scrollTop(),
			maxTop         = orgTable.height() - stickyTableHead.height(),
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

	if ((scrollTop > offsetTop) && (scrollTop < offsetTop + orgTable.height())) {
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
}

(function( $ ) {
	$.widget( "filament.table", { // need to come up with a better namespace var...
 
		options: {
			idprefix: "col-",   // specify a prefix for the values of the id- and columns attributes.
			checkContainer: null // container element where the hide/show checkboxes will be inserted; if none specified, the script creates a menu
		},
 
		// Set up the widget
		_create: function() {
			var self = this,
						o = self.options,
						table = self.element,
						thead = table.find("thead"),
						tbody = table.find("tbody"),
						hdrCells = thead.find("th"),
						bodyRows = tbody.find("tr"),
						container = o.checkContainer ? $(o.checkContainer) : $('<ul class="dropdown-menu"/>'),
						autoHideTrigger = 'auto-on-' + table.attr('id');

			// wrap table in div for scrolling if needed
			if($(table).parent().hasClass('table-scroll-wrapper') === false){
				// console.log('Wrapped table with scroll-wrapper');
				$(table).wrap('<div class="table-scroll-wrapper"/>');
			}
			var tableScrollWrapper = $(table).parent(),
				tableWrapper = tableScrollWrapper.parent();

			// Toolbar
			// -------------------------

			// if no container specified for the checkboxes, create a toolbar with buttons.    
			var btnToolbar = $('<div class="btn-toolbar" />'),
					dropdownGroup = $('<div class="btn-group dropdown-btn-group pull-right" />'),
					dropdownBtn = $('<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">Display <span class="caret"></span></button>'),
					modeGroup = $('<div class="btn-group mode-btn-group" />'),
					modeBtn = $('<button class="btn btn-default">Auto</button>'),
					focusGroup = $('<div class="btn-group focus-btn-group" />'),
					focusBtn = $('<button class="btn btn-default"><span class="glyphicon glyphicon-screenshot"></span> Focus</button>');

			if (table.hasClass('auto-on')) {
				modeBtn.addClass('btn-primary');
			}

			focusGroup.append(focusBtn);
			modeGroup.append(modeBtn);
			dropdownGroup.append(dropdownBtn).append(container);

			btnToolbar.append(focusGroup);
			btnToolbar.append(modeGroup);
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
					id = o.idprefix + i;
					th.attr("id", id);
				}
				 
				// create the hide/show toggle for the current column
				if ( th.is("[data-priority]") ) {
					var toggle = $('<li class="checkbox-row"><input type="checkbox" name="toggle-cols" id="toggle-col-'+i+'" value="'+id+'" /> <label for="toggle-col-'+i+'">'+th.text()+'</label></li>');
					 
					container.append(toggle);

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

			// assign matching "data-columns" attributes to the associated cells "(ells with colspan>1 has multiple columns).
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
						columnsAttr = columnsAttr + " " + o.idprefix + k;

						// get colulm header
						var colHdr = $(tableScrollWrapper).find('#' + o.idprefix + k);

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
				container.find("input").trigger("updateCheck");
 
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

					// console.log("new colSpan:" +Math.max((colSpan - numOfHidden),1));

					//update colSpan to match number of visible columns that i belongs to
					cell.prop('colSpan',Math.max((colSpan - numOfHidden),1));
				});

			});

			// hide toggle button if the list is empty
			if(container.children('li').length === 0){
				container.parent().hide();
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
					updateStickyTableHead(table, stickyTableHead);
			});


		// Auto
		// -------------------------
		modeBtn.click(function(){
			modeBtn.toggleClass('btn-primary');
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

			
							
		}, // end _create
		
		disable: function() {
			// TBD
		},

		enable: function() {
			// TBD
		}
		
	});
}( jQuery ) );