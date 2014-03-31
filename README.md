RWD-Table-Patterns
==================

This is an experimental awesome solution for responsive tables with complex data. It's a fork based on Filament Group's repo with a more complete solutions and some new features.

Features:
--------

####Made for Twitter Bootstrap

Designed to be used with Bootstrap 3. If you don't want to use bootstrap, just fork the repo and customize it to your needs!

####Mobile first

Built with mobile first in mind. As a bonus, the tables won't break on old browsers :)

####Graceful JS fallback

In browsers without JavaScript, the tables will still be scrollable. I.e. there's still some responsiveness.

####Easy to use

You only need to include one JS-file, one CSS-file and one line of JavaScript and your tables are responsive.

Dependencies: jQuery, jQuery-UI-widget, and Twitter Bootstrap 3.


How to use:
--------

####0. Protip: Install using bower
```shell
bower install RWD-Table-Patterns
```

####1. Add CSS file to the ```<head>```
```html
<link rel="stylesheet" href="css/rwd-table.min.css">
```

####2. Add JavaScript either to the ```<head>```, or to the bottom of ```<body>```
```html
<script type="text/javascript" src="js/rwd-table.js"></script>
<script>
   $(function() {
      $('table.responsive').table({
        addAutoButton: true,
        addFocusButton: true,
        fixedNavbar: $('#navbar') //In case you have a fixed navbar.
      })
   });
</script>
```

#####You also need to add the dependencies
- jQuery (>=1.11.0)
- jQuery-UI-widget (>=1.8.16)
- Twitter Bootstrap 3 (>=3.1.1)


####3. Markup
Add ```.responsive``` class to the tables and wrap them in ```.table-responsive```.
You also need to give the able a unique id.
```html
<div class="table-scroll-wrapper" id="example-table">
   <table class="responsive">
      ...
   </table>
</div>
```

####4. Setup your table with ```data-priority``` attributes for each ```<th>```

Attribute          |  Description/Breakpoint
------------------ |  ------------------
data-priority=""   |  Always visible and not hideable from dropdown
data-priority="1"  |  Always visible (but hidable from dropdown)
data-priority="2"  |  Visible when (min-width: 480px)
data-priority="3"  |  (min-width: 640px)
data-priority="4"  |  (min-width: 800px)
data-priority="5"  |  (min-width: 960px)
data-priority="6"  |  (min-width: 1120px)

Demo:
--------

For demo: http://gergeo.se/RWD-Table-Patterns/
