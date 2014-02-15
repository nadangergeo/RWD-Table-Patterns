RWD-Table-Patterns
==================

Changes:
--------

- Bootstrapified it
- Sticky table header
- Support for colspans
- Scrollable on overflow
- Focus-function
- Auto-hide based on column priority now has toggle-button
- Changed the way column priorities are definied. If data-priority is not definied, the column will allways be visible and not hideable from the dropdown).


data-priority="1" : Always visible (but hidable from dropdown)<br>
data-priority="2" : (min-width: 480px)<br>
data-priority="3" : (min-width: 640px)<br>
data-priority="4" : (min-width: 800px)<br>
data-priority="5" : (min-width: 960px)<br>
data-priority="6" : (min-width: 1120px)
