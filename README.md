RWD-Table-Patterns
==================

Changes:
--------

- Now based on bootstrap
- Sticky table header
- Support for colspans
- Scrollable on overflow
- Focus-function
- Auto-hide based on column priority now has toggle-button
- Changed the way column priorities are definied. If data-priority is not definied, 
the column will allways be visible and not hideable from the dropdown).


1. data-priority="1" : Always visible (but hidable from dropdown)
2. data-priority="2" : (min-width: 480px)
3. data-priority="3" : (min-width: 640px)
4. data-priority="4" : (min-width: 800px)
5. data-priority="5" : (min-width: 960px)
6. data-priority="6" : (min-width: 1120px)
