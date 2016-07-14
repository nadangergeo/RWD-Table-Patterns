RWD-Table-Patterns
==================

This is an experimental awesome solution for responsive tables with complex data. It's a fork based on Filament Group's repo with a more complete solution and some new features.

**Note:** The [dev branch](https://github.com/nadangergeo/RWD-Table-Patterns/tree/dev) contains a bunch of bug-fixes and the code is prettier... Although, we cannot guarantee its stability yet. Any contributions and testing is welcomed :)

Demo:
--------

http://gergeo.se/RWD-Table-Patterns/

Features:
--------

#### :bird: Made for Bootstrap

Designed to be used with Bootstrap 3. If you don't want to use bootstrap, just fork the repo and customize it to your needs!

#### :iphone: Mobile first & PE

Built with mobile first and progressive enhancement in mind. Also built with love and with the help of a fair amount of coffee.

#### :coffee: Graceful JS fallback

In browsers without JavaScript, the tables will still be scrollable. I.e. there's still some responsiveness.

#### :thumbsup: Easy to use

You only need to add one JS-file, one CSS-file and some minimal setup to make the tables responsive.

Dependencies: jQuery and Bootstrap 3.


How to use:
--------

####Protip: Install using Bower
```shell
bower install RWD-Table-Patterns
```

####Add CSS file to the ```<head>```
```html
<link rel="stylesheet" href="css/rwd-table.min.css">
```

####Add JavaScript file either to the ```<head>```, or to the bottom of ```<body>```
```html
<script type="text/javascript" src="js/rwd-table.js"></script>
```

#####You also need to add the dependencies
- jQuery (>=1.11.0)
- Bootstrap 3 (>=3.1.1)
   - normalize.less
   - buttons.less
   - button-groups.less
   - dropdowns (.less &amp; .js)
   - tables.less
   - glyphicons needed for default *focusBtnIcon* option.

####Markup
1. Add the classes ```.table``` to the tables and wrap them in ```.table-responsive```, as usual when using Bootstrap.
2. If the table has complex data and many columns you can give it the class ```.table-small-font``` (highly recommended).
3. The table can also utilize Bootstrap's table classes, such as ```.table-striped``` and ```.table-bordered```.
```html
<div class="table-responsive">
   <table id="example-table" class="table table-small-font table-bordered table-striped">
      ...
   </table>
</div>
```

####Initialize via data attributes
You can initalize the table without writing any JavaScript, just like Bootstrap. Just add the attribute ```data-pattern="priority-columns"``` to the ```.table-responsive``` div.
```html
<div class="table-responsive" data-pattern="priority-columns">
      ...
</div>
```

####Initialize via JavaScript
```html
<script>
   $(function() {
      $('.table-responsive').responsiveTable({options});
   });
</script>
```

####Options
Options can be passed via data attributes or JavaScript. For data attributes, append the option name to ```data-``` with hyphens instead of camelCase, as in ```data-add-focus-btn=""```.
<table>
  <thead>
   <tr>
     <th>Name</th>
     <th>type</th>
     <th>default</th>
     <th>description</th>
   </tr>
  </thead>
  <tbody>
   <tr>
     <td>pattern</td>
     <td>string</td>
     <td>'priority-columns'</td>
     <td>
       <p>What responsive table pattern to use. For now, <code>'priority-columns'</code> is the only pattern available.</p>
       <p><strong>Tips:</strong> When initalizing via JavaScript, add <code>data-pattern=""</code> to responsive tables you wan't to exclude.</p>
     </td>
   </tr>
   <tr>
     <td>stickyTableHeader</td>
     <td>boolean</td>
     <td>true</td>
     <td>Makes the table header persistent.</td>
   </tr>
   <tr>
     <td>fixedNavbar</td>
     <td>string</td>
     <td>'.navbar-fixed-top'</td>
     <td>
         <p>Is there a fixed navbar? The sticky table header needs to know about it!
           The option is the selector used to find the navbar. 
           Don't worry about the default value if you don't have a fixed navbar.</p>
         <p><strong>Example:</strong> <code>'#navbar'</code></p>
     </td>
   </tr>
   <tr>
     <td>addDisplayAllBtn</td>
     <td>boolean</td>
     <td>true</td>
     <td>Add 'Display all' button to the toolbar above the table.</td>
   </tr>
   <tr>
     <td>addFocusBtn</td>
     <td>boolean</td>
     <td>true</td>
     <td>Add 'Focus' toggle button to the toolbar above the table.</td>
   </tr>
   <tr>
     <td>focusBtnIcon</td>
     <td>string</td>
     <td>'glyphicon glyphicon-screenshot'</td>
     <td>
         Icon for the focus btn specified with classes.
     </td>
   </tr>
   <tr>
     <td>i18n</td>
     <td>object</td>
     <td>{
           focus     : 'Focus',
           display   : 'Display',
           displayAll: 'Display all'
         }
     </td>
     <td>
         Used to translate the buttons (only works if you initialize via JavaScript).
     </td>
   </tr>
  </tbody>
</table>

####Setup your table with ```data-priority``` attributes for each ```<th>```

Attribute          |  Description/Breakpoint
------------------ |  ------------------
data-priority=""   |  Always visible and not hideable from dropdown
data-priority="1"  |  Always visible (but hidable from dropdown)
data-priority="2"  |  Visible when (min-width: 480px)
data-priority="3"  |  (min-width: 640px)
data-priority="4"  |  (min-width: 800px)
data-priority="5"  |  (min-width: 960px)
data-priority="6"  |  (min-width: 1120px)

####HTML Classes
For better IE support, you need to have IE classes. Replace ```<html>``` with:
```html
<!--[if lt IE 7 ]> <html lang="en" class="no-js lt-ie10 lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js lt-ie10 lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js lt-ie10 lt-ie9"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js lt-ie10"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"> <!--<![endif]-->
```
#####no-js class
The ```.no-js``` class is used to determine if the browser does not have JavaScript support or if JavaScript is disabled. The class is not used right now, but you should consider adding it anyway in case a future release has a patch that depends on it.
