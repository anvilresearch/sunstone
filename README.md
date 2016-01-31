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

## Remaining Work

* [ ] unit tests
* [ ] plugin loading from npm packages
* [ ] plugin detection/initialization during runtime
* [ ] configurable plugin directories
* [ ] methods for controlling lifecycle from outside the running application
* [ ] stop, enable, disable, install, remove methods for plugins
* [ ] plugin security
* [ ] ...

## MIT License

Copyright (c) 2016 [Anvil Research, Inc.](http://anvil.io)
