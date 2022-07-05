RWD-Table-Patterns
==================

This is an ~~experimental~~ awesome solution for responsive tables with complex data. It was *originally* based on [Filament Group's experimental repo](https://github.com/filamentgroup/RWD-Table-Patterns), but has during the years grown up to be a more complete solution with new features.

Demo:
--------

http://gergeo.se/RWD-Table-Patterns/

Features:
--------

#### :bird: Made for Bootstrap

Designed to be used with Bootstrap 5. If you don't want to use bootstrap, just fork the repo and customize it to your needs!

#### :iphone: Mobile first & PE

Built with mobile first and progressive enhancement in mind. Also built with love and with the help of a fair amount of coffee.

#### :coffee: Graceful JS fallback

In browsers without JavaScript, the tables will still be scrollable. I.e. there's still some responsiveness.

#### :thumbsup: Easy to use

You only need to add one JS-file, one CSS-file and some minimal setup to make the tables responsive.

Dependencies: jQuery and Bootstrap 3.


How to use:
--------
### 1. Installation

#### Install using NPM
```shell
npm i RWD-Table-Patterns@5.3.3
```

#### Add CSS file to the ```<head>```
```html
<link rel="stylesheet" href="css/rwd-table.min.css">
```

#### Add JavaScript file either to the ```<head>```, or to the bottom of ```<body>```
```html
<script type="text/javascript" src="js/rwd-table.js"></script>
```

##### You also need to add the dependencies
- jQuery (>=1.11.0)
- Bootstrap 5 (>=5.2)

### 2. Markup
1. Add the classes ```table``` to the tables and wrap them in ```table-responsive```, as usual when using Bootstrap.
2. If the table has complex data and many columns you can give it the class ```table-small-font``` and ```table-tighten``` (highly recommended).
3. The table can also utilize Bootstrap's table classes, such as ```table-striped``` and ```table-bordered```.
```html
<div class="table-responsive">
   <table id="example-table" class="table table-small-font table-tighten table-bordered table-striped">
      ...
   </table>
</div>
```


### 3. Initialize
#### Alternative 1: Initialize via data attributes
You can initalize the table without writing any JavaScript, just like Bootstrap. Just add the attribute ```data-pattern="priority-columns"``` to the ```table-responsive``` div.
```html
<div class="table-responsive" data-pattern="priority-columns">
      ...
</div>
```

#### Alternative 2: Initialize via JavaScript *instead*
```html
<script>
   $(function() {
      $('.table-responsive').responsiveTable({options});
   });
</script>
```

#### Alternative 3: Initialize via JavaScript (selecting with ID)
```html
<script>
   $(function() {
      $('#myTableWrapper').responsiveTable({options});
   });
</script>
```

### 4. Options
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
     <td>'fa fa-crosshairs'</td>
     <td>
         Icon for the focus btn specified with classes.
     </td>
   </tr>
   <tr>
     <td>i18n</td>
     <td>object</td>
     <td>{
           focus : 'Focus',
           display : 'Display',
           displayAll : 'Display all'
         }
     </td>
     <td>
         Used to translate the buttons (only works if you initialize via JavaScript).
     </td>
   </tr>
  </tbody>
</table>

### 5. Setup your table with ```data-priority``` attributes for each ```<th>```

Attribute          |  Description/Breakpoint
------------------ |  ------------------
data-priority="-1" |  Hidden and and not togglable from dropdown
data-priority="0"  |  Hidden per default (but togglable from dropdown)
data-priority=""   |  Always visible and not hideable from dropdown
data-priority="1"  |  Always visible (but hidable from dropdown)
data-priority="2"  |  Visible when (min-width: 480px)
data-priority="3"  |  (min-width: 640px)
data-priority="4"  |  (min-width: 800px)
data-priority="5"  |  (min-width: 960px)
data-priority="6"  |  (min-width: 1120px)

### 6. Setup your table toolbar with `data-responsive-table-toolbar` attribute

<table>
    <thead>
        <tr>
            <th>Attribute</th>
            <th>Description/Usage</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>data-responsive-table-toolbar="table-id"</code></td>
            <td>
                <p>
                    Designates DOM element as toolbar for table with id of <code>table-id</code>
                </p>
                <p>
                    <b>Default:</b>
                    A new <code>&lt;div&gt;</code> toolbar element is appended to element with table wrapper class <code>responsive-table</code>.
                </p>
            </td>
        </tr>
    </tbody>
</table>

### 7. Dynamic content? Call Update()!

There is an update method which you can call when the content in tbody/tfoot has changed. *The method will in turn call the private method setupBodyRows() which sets up rows that has not been setup, as well as update the sticky table header (to accommodate for any changes in columns widths).*

**You can call the method like this:**

```js
$('.table-responsive').responsiveTable('update');
```

**or perhaps like this, if you want to select by id:**

```js
$('#the_id_to_the_table_responsive_wrapper').responsiveTable('update');
```

The API is inspired by Bootstrap's programmatic API. If you are curious about how the hell the method call is being done, see the following lines of code: [rwd-table.js#L692-L694](https://github.com/nadangergeo/RWD-Table-Patterns/blob/3066664fc406a19a1a8aa00dc69f2369406b5dd0/src/js/rwd-table.js#L692-L694)

### 8. HTML Classes
For better IE support, you need to have IE classes. Replace ```<html>``` with:
```html
<!--[if lt IE 7 ]> <html class="no-js lt-ie10 lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7 ]>    <html class="no-js lt-ie10 lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8 ]>    <html class="no-js lt-ie10 lt-ie9"> <![endif]-->
<!--[if IE 9 ]>    <html class="no-js lt-ie10"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html class="no-js"> <!--<![endif]-->
```
##### no-js class
The ```no-js``` class is used to determine if the browser does not have JavaScript support or if JavaScript is disabled. The class is not used right now, but you should consider adding it anyway in case a future release has a patch that depends on it.
