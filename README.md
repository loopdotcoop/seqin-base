# Seqin

#### The base class for all sequencer instruments.

It’s not usually used directly - it just generates silent buffers.


Authors
-------
Built by Rich Plastow and Monty Anderson for Loop.Coop.

+ __Homepage:__     [loopdotcoop.github.io/seqin-base/](https://loopdotcoop.github.io/seqin-base/)
+ __GitHub:__       [loopdotcoop/seqin](https://github.com/loopdotcoop/seqin-base)
+ __NPM:__          [seqin-base](https://www.npmjs.com/package/seqin-base)
+ __Twitter:__      [@loopdotcoop](https://twitter.com/loopdotcoop)
+ __Location:__     Brighton, UK


App
---
+ __Last update:__  2017/07/28
+ __Version:__      1.0.2


Tested
------
+ __Android 7.1 (Pixel):__  Chrome 58+, Firefox 51+
+ __iOS 10.3 (iPad Pro):__  Safari 10+
+ __Windows 10:__           Edge 14+
+ __Windows 7:__            Chrome 49+, Opera 36+
+ __Windows XP:__           Firefox 45+
+ __OS X El Sierra:__       Safari 10.1+


Changelog
---------
+ 0.0.1       Initial commit on master branch; isomorphic mocha/chai working
+ 0.0.2       Fix incorrect "main" value in package.json
+ 0.0.3       Part way through getBuffers()
+ 0.0.4       getBuffers() complete
+ 0.0.5       Stricter config validation; tests are ‘common’ or ‘specific’
+ 0.0.6       Correct hash-test in support/test-specific-browser.js
+ 0.0.7       Move to github.com/loopdotcoop/seqin-base
+ 0.0.8       ‘ready’ property and getBuffers() return Promises
+ 0.0.9       Rename getBuffers() to perform()
+ 0.0.10      perform() defers validation to private methods
+ 0.0.11      Move Mocha and Chai from local node_modules to global
+ 0.0.12      ‘down’ and ‘gain’ events expect a number between 0 and 9
+ 0.0.13      Better use of Promises
+ 0.0.14      Verbose self-description of constructor() and perform() configs
+ 1.0.0       Move to github.com/loopdotcoop/seqin-base
+ 1.0.1       Bumped for NPM
+ 1.0.2       Fully tested cross-browser (see README.md#Tested)
