/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import semver from 'semver';
import { getLogger } from '@balena/jellyfish-logger';
import type { Context } from '@balena/jellyfish-types/build/core';
import { INTERFACE_VERSION } from './version';
import type {
	Map,
	JellyfishPluginConstructor,
	JellyfishPlugin,
	JellyfishPlugins,
	PluginManagerOptions,
	Actions,
	Integrations,
	Contracts,
	CoreMixins,
} from './types';

const logger = getLogger(__filename);

const validateDependencies = (plugins: JellyfishPlugins) => {
	_.forEach(plugins, (plugin) => {
		if (
			semver.major(plugin.interfaceVersion) !== semver.major(INTERFACE_VERSION)
		) {
			throw new Error(
				`Cannot load plugin '${plugin.slug}' (${plugin.name}) ` +
					`because it's interface version (${plugin.interfaceVersion}) ` +
					`is not compatible with the plugin manager's interface ` +
					`version (${INTERFACE_VERSION})`,
			);
		}
		_.forEach(plugin.requires, ({ slug, version }) => {
			const dependency = plugins[slug];
			if (!semver.validRange(version)) {
				throw new Error(
					`Cannot load plugin '${plugin.slug}' (${plugin.name}) ` +
						`because it specifies an invalid version (${version}) for the dependency on '${slug}'`,
				);
			}
			if (!dependency) {
				throw new Error(
					`Cannot load plugin '${plugin.slug}' (${plugin.name}) ` +
						`because a plugin it depends on (${slug}) is not loaded`,
				);
			} else if (
				!semver.satisfies(dependency.version, version, {
					includePrerelease: true,
				})
			) {
				throw new Error(
					`Cannot load plugin '${plugin.slug}' (${plugin.name}) ` +
						`because a plugin it depends on (${slug}@${version}) is not loaded`,
				);
			}
		});
	});
};

const loadPlugins = (plugins: JellyfishPluginConstructor[]) => {
	const allPlugins = _.reduce<JellyfishPluginConstructor, JellyfishPlugins>(
		plugins,
		(acc, Plugin: JellyfishPluginConstructor) => {
			const loadedPlugin = new Plugin();
			if (loadedPlugin) {
				if (acc[loadedPlugin.slug]) {
					throw new Error(
						`Cannot load plugin '${loadedPlugin.slug}' (${
							loadedPlugin.name
						}) because a plugin with that slug (${
							acc[loadedPlugin.slug].name
						}) has already been loaded`,
					);
				}
				acc[loadedPlugin.slug] = loadedPlugin;
			}
			return acc;
		},
		{},
	);
	validateDependencies(allPlugins);
	return allPlugins;
};

const validatedAddToMap = <T>(
	context: Context,
	plugin: JellyfishPlugin,
	pluginItems: Map<T>,
	consolidatedItems: Map<T>,
	itemName: string,
) => {
	_.each(pluginItems, (item: T, slug: string) => {
		if (consolidatedItems[slug]) {
			const errorMessage = `${itemName} '${slug}' already exists and cannot be loaded from plugin '${plugin.name}'`;
			logger.error(context, errorMessage);
			throw new Error(errorMessage);
		}

		consolidatedItems[slug] = item;
	});
};

export class PluginManager {
	private _plugins: JellyfishPlugins;

	interfaceVersion: string;

	constructor(context: Context, options: PluginManagerOptions) {
		this.interfaceVersion = INTERFACE_VERSION;
		try {
			this._plugins = loadPlugins(options.plugins);
		} catch (err: any) {
			logger.error(context, err.message);
			throw err;
		}
	}

	getCards(context: Context, mixins: CoreMixins) {
		return _.reduce<JellyfishPlugins, Contracts>(
			this._plugins,
			(carry, plugin) => {
				if (plugin.getCards) {
					const pluginCards = plugin.getCards(context, mixins);
					validatedAddToMap(context, plugin, pluginCards, carry, 'Card');
				}
				return carry;
			},
			{},
		);
	}

	getSyncIntegrations(context: Context) {
		return _.reduce<JellyfishPlugins, Integrations>(
			this._plugins,
			(carry, plugin) => {
				if (plugin.getSyncIntegrations) {
					const pluginIntegrations = plugin.getSyncIntegrations(context);
					validatedAddToMap(
						context,
						plugin,
						pluginIntegrations,
						carry,
						'Integration',
					);
				}
				return carry;
			},
			{},
		);
	}

	getActions(context: Context) {
		return _.reduce<JellyfishPlugins, Actions>(
			this._plugins,
			(carry, plugin) => {
				if (plugin.getActions) {
					const pluginActions = plugin.getActions(context);
					validatedAddToMap(context, plugin, pluginActions, carry, 'Action');
				}
				return carry;
			},
			{},
		);
	}
}
