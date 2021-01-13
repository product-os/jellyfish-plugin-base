# Jellyfish Plugin Base

This library contains the building blocks of the Jellyfish Plugin system:
* `PluginManager`. The plugin manager is provided with a list of plugins and is responsible for _instantiating_, _validating_ (e.g. checking for duplicate slugs across plugins) and _loading_ these plugins in the correct order (for example respecting where one plugin `requires` another).
* `JellyfishPlugin` - an 'abstract' class which all Jellyfish plugins should extend. This class encapsulates the logic/helper methods for validating and loading cards, integrations, actions, lenses etc and exposing them in the format expected (e.g. an object of cards keyed by slugs).
* Generic unit tests for plugins. These include basic generic sanity tests for plugins that each plugin repo can import and run rather than writing explicitly each time.

# Usage

Below is an example how to use this library:

```js
const {
	PluginManager
} = require('@balena/jellyfish-plugin-base')
const DefaultPlugin = require('@balena/jellyfish-plugin-default')

const pluginManager = new PluginManager([
	DefaultPlugin
])
const cards = pluginManager.getCards(mixins)
```

# Documentation

Visit the website for complete documentation: https://product-os.github.io/jellyfish-plugin-base
