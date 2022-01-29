**Notice: This utility has been discontinued. The functionality provided by this module has been merged into [`jellyfish-worker`](https://github.com/product-os/jellyfish-worker).**

# Jellyfish Plugin Base

This library contains the building blocks of the Jellyfish Plugin system:
* `PluginManager`. The plugin manager is provided with a list of plugins and is responsible for _instantiating_, _validating_ (e.g. checking for duplicate slugs across plugins) and _loading_ these plugins in the correct order (for example respecting where one plugin `requires` another).
* `JellyfishPluginBase` - an 'abstract' class which all Jellyfish plugins should extend. This class encapsulates the logic/helper methods for validating and loading cards, integrations, actions, lenses etc and exposing them in the format expected (e.g. an object of cards keyed by slugs).
* Generic unit tests for plugins. These include basic generic sanity tests for plugins that each plugin repo can import and run rather than writing explicitly each time.

# Usage

## `JellyfishPluginBase`

Below is an example how to use the `JellyfishPluginBase` base class exported by this library:

```js
const {
	JellyfishPluginBase
} = require('@balena/jellyfish-plugin-base')

class MyPlugin extends JellyfishPluginBase {
	constructor() {
		super({
			slug: 'my-plugin',
			name: 'My Plugin',
			version: '1.0.0',
			cards: [],
			mixins: {},
			integrations: [],
			actions: [],
		})
	}
}
```

The `JellyfishPluginBase` constructor takes a single argument with the following properties:

* **slug** - the unique identifying slug for the plugin. Can only contain lowercase letters, numbers and '-'.
* **name** - a user-friendly name for the plugin.
* **version** - the version of the plugin. Used for compatibility checks when one plugin requires another plugin.
* **requires** - an optional array of objects identifying other plugins that are required for this plugin to work.
* **cards** - an optional array of cards defined by the plugin. Each item in the array can be a plain JavaScript object representing the card or a function that takes mixins as an argument and returns a card object (for cards that use mixins).
* **mixins** - an optional map of mixins defined by the plugin that are used by the plugin's cards.
* **integrations** - an optional array of integrations defined by the plugin.
* **actions** - an optional array of actions defined by the plugin.

_Note: the order of cards in the cards array is important. Specifically, any type cards must be placed above/before any cards of that type._

## `PluginManager`

Below is an example how to use the plugin manager exported by this library:

```js
const {
	PluginManager
} = require('@balena/jellyfish-plugin-base')
const DefaultPlugin = require('@balena/jellyfish-plugin-default')

const pluginManager = new PluginManager(
	context, {
		plugins: [
			DefaultPlugin
		]
	}
)

const cards = pluginManager.getCards(context, mixins)
```

# Documentation

[![Publish Documentation](https://github.com/product-os/jellyfish-plugin-base/actions/workflows/publish-docs.yml/badge.svg)](https://github.com/product-os/jellyfish-plugin-base/actions/workflows/publish-docs.yml)

Visit the website for complete documentation: https://product-os.github.io/jellyfish-plugin-base
