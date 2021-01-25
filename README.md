# Jellyfish Plugin Base

This library contains the building blocks of the Jellyfish Plugin system:
* `PluginManager`. The plugin manager is provided with a list of plugins and is responsible for _instantiating_, _validating_ (e.g. checking for duplicate slugs across plugins) and _loading_ these plugins in the correct order (for example respecting where one plugin `requires` another).
* `JellyfishPlugin` - an 'abstract' class which all Jellyfish plugins should extend. This class encapsulates the logic/helper methods for validating and loading cards, integrations, actions, lenses etc and exposing them in the format expected (e.g. an object of cards keyed by slugs).
* Generic unit tests for plugins. These include basic generic sanity tests for plugins that each plugin repo can import and run rather than writing explicitly each time.

# Usage

## `JellyfishPlugin`

Below is an example how to use the `JellyfishPlugin` base class exported by this library:

```js
const {
	JellyfishPlugin
} = require('@balena/jellyfish-plugin-base')

class MyPlugin extends JellyfishPlugin {
	constructor() {
		super({
			cards: [],
			mixins: {},
			integrations: []
		})
	}
}

const myPlugin = new MyPlugin()

```

The `JellyfishPlugin` constructor takes a single argument with the following optional properties:

* **cards** - an array of cards defined by the plugin. Each item in the array can be a plain JavaScript object representing the card or a function that takes mixins as an argument and returns a card object (for cards that use mixins).
* **mixins** - a map of mixins defined by the plugin that are used by the plugin's cards.
* **integrations** - an array of integrations defined by the plugin.

## `PluginManager`

Below is an example how to use the plugin manager exported by this library:

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
