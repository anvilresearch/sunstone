## Sunstone

Sunstone is a library that implements plugin architecture for Nodejs. You can
use it to create applications that your users can extend by creating plugins.

## Plugin Architecture

The primary goal of a plugin architecture is extensibility; the ability to
customize or add new features to software without modifying it's source code.
Plugins provide extensibility through modularity and by establishing well-
defined interfaces for programming with the host application's internal
components.

The modularity offered by plugins makes it possible to write large and complex
programs. But it also helps to manage project scope, since every possible
contingency for user requirements need not be planned for in advance. Users can
obtain plugins created by third-party developers and even write their own.

### Dependency Injection

Nodejs' built in module system isn't adequate for a plugin architecture, because
it would require the plugin developer to have knowledge of how the host
application and even other plugins are implemented. Dependency injection solves
this problem by abstracting the details of how to obtain plugin-component-level
dependencies for use in other plugins. Sunstone's DI implementation borrows
elements of the programming interface from AngularJS.

### Lifecycle Management

Plugins have a lifecycle that can be controlled during runtime. This enables
features to be added and removed without restarting the application.

### Plugin Dependencies & Versioning

* Plugins are versioned and can depend on other plugins.

### Plugin Security

* Plugins can expose or protect components
* Plugins are verified with signatures and checksums
* Plugins be required to have permission to run

## Completed Work

* [x] host application instantiation
* [x] plugin registry
* [x] plugin loading from host and extending apps
* [x] plugin dependency validation
* [x] plugin development interface
* [x] injector (DI container)
* [x] node module registration
* [x] component extension
* [x] plugin API extension
* [x] initializer callback
* [x] starter callback
* [x] component registration validation
* [x] registry and injector filtering
* [x] configurable plugin directories

## Remaining Work

* [ ] unit tests
* [ ] plugin loading from npm packages
* [ ] plugin detection/initialization during runtime
* [ ] methods for controlling lifecycle from outside the running application
* [ ] stop, enable, disable, install, remove methods for plugins
* [ ] plugin security
* [ ] ...

## Usage

### Install

```bash
$ npm install --save sunstone
```

### Setting up a host application

Creating your host application is as easy as requiring `sunstone`, configuring 
the directories to search for plugins, and exporting the resulting application.
All additional application logic lives in plugins.

```javascript
var path = require('path')

// Create a new host application and configure the plugin directories
module.exports = require('sunstone').bootstrap({
  directories: [
    path.join(__dirname, 'plugins'),      // built-in plugins
    path.join(process.cwd(), 'plugins')   // user extensions
  ]
})
```

The above code should live in a file referenced as `main` in your `package.json`:

```json
{
  "name": "your-app",
  "version": "0.1.0",
  "description": "An app that can be extended with plugins",
  "main": "index.js",
  // ...
}
```

### Setting up an extending application

Once you've created a host application and made it available as a npm package,
it can be run with one line of code. All extensions are plugins and live in the 
configured plugins directory.

```javascript
// require the app you want to extend and run it
require('your-app').run()
```

### Creating plugins

Each plugin is a directory inside one of the configured plugin directories for 
the host or extending applications. Plugin directories can have an arbitrary 
number of files in any kind of organization, with only one rule. Each must 
plugin must include an `index.js` file at its root level that is used to register 
the plugin.

The `index.js` file must export a function that takes the plugin registry as 
an argument. The argument can be named anything you want. This might be helpful 
to developers extending our app with their own plugins. For example, we might 
want to call our app "anvil". 

```javascript
// export a function that takes the plugin registry as an argument
module.exports = function (anvil) {
  // ...
}
```

For the remaining examples here, we'll stick to "app". Plugins are defined 
inside this exported function by calling `app.plugin(<NAME>, <METADATA>)`.
This returns a `plugin` object providing the API that's used to build up 
your plugin components and define lifecycle behavior. The most important 
method provided by `plugin` is `initializer`. This method takes a callback
that acts as a wrapper around the rest of your plugin definition. The 
'initializer' callback allows plugins to be loaded and have their dependencies 
resoved before initializing the plugin.

```javascript
'use strict'

module.exports = function (app) {

  // define a new plugin by providing a name and metadata
  app.plugin('feature', {
    version: '0.1.2',
    dependencies: {
      'server': '>=1.0.0'
    }
  })

  // this wrapper allows plugins to be loaded before initializing them, 
  // so that dependencies can be verified
  .initializer(function (plugin) {

    // use the plugin development API here

  })
}
```

### Using the plugin API

See the full [API documentation](http://anvilresearch.github.io/sunstone/).


## MIT License

Copyright (c) 2016 [Anvil Research, Inc.](http://anvil.io)
