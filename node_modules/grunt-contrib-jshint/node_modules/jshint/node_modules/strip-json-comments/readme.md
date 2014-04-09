# strip-json-comments [![Build Status](https://secure.travis-ci.org/sindresorhus/strip-json-comments.png?branch=master)](http://travis-ci.org/sindresorhus/strip-json-comments)

> Strip comments from JSON. Lets you use comments in your JSON files!

This is now possible:

```js
{
	// rainbows
	"unicorn": /* ❤ */ "cake"
}
```

*There's already [json-comments](https://npmjs.org/package/json-comments), but it's only for Node.js and uses a naive regex to strip comments which fails on simple cases like `{"a":"//"}`. This module however parses out the comments.*


## Install

Download [manually](https://github.com/sindresorhus/strip-json-comments/releases) or with a package-manager.

#### [npm](https://npmjs.org/package/strip-json-comments)

```
npm install --save strip-json-comments
```

Or globally if you want to use it as a CLI app:

```
npm install --global strip-json-comments
```

You can then use it in your Terminal like:

```
strip-json-comments with-comments.json > without.json
```

Or pipe something to it:

```
cat with-comments.json | strip-json-comments > without.json
```

#### [Bower](http://bower.io)

```
bower install --save strip-json-comments
```

#### [Component](https://github.com/component/component)

```
component install sindresorhus/strip-json-comments
```


## Examples

### Node.js

```js
var stripJsonComments = require('strip-json-comments');
var json = '{//rainbows\n"unicorn":"cake"}';
JSON.parse(stripJsonComments(json));
//=> {unicorn: 'cake'}
```

### Bower

```html
<script src="bower_components/strip-json-comments/strip-json-comments.js"></script>
```

```js
var json = '{//rainbows\n"unicorn":"cake"}';
JSON.parse(stripJsonComments(json));
//=> {unicorn: 'cake'}
```


## API

### stripJsonComments(*string*)

Accepts a string with JSON and strips out the comments.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
