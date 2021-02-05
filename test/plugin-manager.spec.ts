/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import { PluginManager } from '../lib/plugin-manager';
import { INTERFACE_VERSION } from '../lib/version';
import {
	TestPluginFactory,
	card1,
	card2,
	integration1,
	integration2,
	action1,
	action2,
	mixins,
} from './fixtures';

const context = {
	id: 'plugin-manager-test',
};

describe('PluginManager', () => {
	describe('validates plugins', () => {
		test('by throwing an exception if you try and load two plugins with the same slug', () => {
			const getPluginManager = () =>
				new PluginManager(context, {
					plugins: [
						TestPluginFactory({ slug: 'test-plugin-1', name: 'Test plugin 1' }),
						TestPluginFactory({ slug: 'test-plugin-1', name: 'Test plugin 2' }),
					],
				});
			expect(getPluginManager).toThrow(
				"Cannot load plugin 'test-plugin-1' (Test plugin 2) " +
					'because a plugin with that slug (Test plugin 1) has already been loaded',
			);
		});

		test('by throwing an exception if a plugin requires another plugin that is not provided', () => {
			const getPluginManager = () =>
				new PluginManager(context, {
					plugins: [
						TestPluginFactory({
							slug: 'test-plugin-2',
							name: 'Test plugin 2',
							requires: [
								{
									slug: 'test-plugin-1',
									version: '^2.0.0',
								},
							],
						}),
					],
				});
			expect(getPluginManager).toThrow(
				"Cannot load plugin 'test-plugin-2' (Test plugin 2) " +
					'because a plugin it depends on (test-plugin-1) is not loaded',
			);
		});

		test('by throwing an exception if a plugin requires a version of another plugin that is not provided', () => {
			const getPluginManager = () =>
				new PluginManager(context, {
					plugins: [
						TestPluginFactory({
							slug: 'test-plugin-1',
							name: 'Test plugin 1',
							version: '1.0.0',
						}),
						TestPluginFactory({
							slug: 'test-plugin-2',
							name: 'Test plugin 2',
							requires: [
								{
									slug: 'test-plugin-1',
									version: '^2.0.0',
								},
							],
						}),
					],
				});
			expect(getPluginManager).toThrow(
				"Cannot load plugin 'test-plugin-2' (Test plugin 2) " +
					'because a plugin it depends on (test-plugin-1@^2.0.0) is not loaded',
			);
		});

		test('by throwing an exception if a plugin implements an incompatible interface version', () => {
			const getPluginManager = () =>
				new PluginManager(context, {
					plugins: [
						TestPluginFactory({
							slug: 'test-plugin-1',
							name: 'Test plugin 1',
							interfaceVersion: '0.0.1',
						}),
					],
				});
			expect(getPluginManager).toThrow(
				`Cannot load plugin 'test-plugin-1' (Test plugin 1) ` +
					`because it's interface version (0.0.1) ` +
					`is not compatible with the plugin manager's interface ` +
					`version (${INTERFACE_VERSION})`,
			);
		});

		test('but will not throw an exception if a plugin requires a version of another plugin that is provided', () => {
			const getPluginManager = () =>
				new PluginManager(context, {
					plugins: [
						TestPluginFactory({
							slug: 'test-plugin-1',
							name: 'Test plugin 1',
							version: '1.1.0',
						}),
						TestPluginFactory({
							slug: 'test-plugin-2',
							name: 'Test plugin 2',
							requires: [
								{
									slug: 'test-plugin-1',
									version: '^1.0.0',
								},
							],
						}),
					],
				});
			expect(getPluginManager).not.toThrow();
		});

		test('but will not throw an exception if a plugin requires a version of another plugin that is provided as a beta version', () => {
			const getPluginManager = () =>
				new PluginManager(context, {
					plugins: [
						TestPluginFactory({
							slug: 'test-plugin-1',
							name: 'Test plugin 1',
							version: '1.0.1-beta-1',
						}),
						TestPluginFactory({
							slug: 'test-plugin-2',
							name: 'Test plugin 2',
							requires: [
								{
									slug: 'test-plugin-1',
									version: '^1.0.0',
								},
							],
						}),
					],
				});
			expect(getPluginManager).not.toThrow();
		});
	});

	describe('.interfaceVersion', () => {
		test('returns the value of INTERFACE_VERSION', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [TestPluginFactory({})],
			});
			expect(pluginManager.interfaceVersion).toBe(INTERFACE_VERSION);
		});
	});

	describe('.getCards', () => {
		test('returns an empty object if no cards are supplied to any of the plugins', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({ slug: 'test-plugin-1' }),
					TestPluginFactory({ slug: 'test-plugin-2' }),
				],
			});
			const cards = pluginManager.getCards(context, mixins);
			expect(cards).toEqual({});
		});

		test('will throw an exception if different plugins contain duplicate card slugs', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({
						slug: 'test-plugin-1',
						name: 'Test Plugin 1',
						cards: [card1],
					}),
					TestPluginFactory({
						slug: 'test-plugin-2',
						name: 'Test Plugin 2',
						cards: [Object.assign({}, card2, { slug: card1.slug })],
					}),
				],
			});
			const getCards = () => pluginManager.getCards(context, mixins);

			expect(getCards).toThrow(
				"Card 'card-1' already exists and cannot be loaded from plugin 'Test Plugin 2'",
			);
		});

		test('returns a dictionary of cards, keyed by slug', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({
						cards: [
							// Cards can be passed in as objects:
							card1,
							// ...or as a function that returns a card
							({ mixin }) => mixin([])(card2),
						],
					}),
				],
			});

			const cards = pluginManager.getCards(context, mixins);
			expect(cards).toEqual({
				'card-1': card1,
				'card-2': card2,
			});
		});
	});

	describe('.getSyncIntegrations', () => {
		test('returns an empty object if no integrations are supplied to any of the plugins', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({ slug: 'test-plugin-1' }),
					TestPluginFactory({ slug: 'test-plugin-2' }),
				],
			});
			const loadedIntegrations = pluginManager.getSyncIntegrations(context);
			expect(loadedIntegrations).toEqual({});
		});

		test('will throw an exception if duplicate integration slugs are found', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({
						slug: 'test-plugin-1',
						name: 'Test Plugin 1',
						integrations: [integration1],
					}),
					TestPluginFactory({
						slug: 'test-plugin-2',
						name: 'Test Plugin 2',
						integrations: [
							Object.assign({}, integration2, { slug: integration1.slug }),
						],
					}),
				],
			});

			const getSyncIntegrations = () =>
				pluginManager.getSyncIntegrations(context);

			expect(getSyncIntegrations).toThrow(
				"Integration 'integration-1' already exists and cannot be loaded from plugin 'Test Plugin 2'",
			);
		});

		test('returns a dictionary of integrations keyed by slug', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({
						slug: 'test-plugin-1',
						integrations: [integration1],
					}),

					TestPluginFactory({
						slug: 'test-plugin-2',
						integrations: [integration2],
					}),
				],
			});

			const loadedIntegrations = pluginManager.getSyncIntegrations(context);

			expect(loadedIntegrations).toEqual({
				'integration-1': integration1,
				'integration-2': integration2,
			});
		});
	});

	describe('.getActions', () => {
		test('returns an empty object if no actions are supplied to any of the plugins', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({ slug: 'test-plugin-1' }),
					TestPluginFactory({ slug: 'test-plugin-2' }),
				],
			});
			const loadedActions = pluginManager.getActions(context);
			expect(loadedActions).toEqual({});
		});

		test('will throw an exception if duplicate action slugs are found', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({
						slug: 'test-plugin-1',
						name: 'Test Plugin 1',
						actions: [action1],
					}),
					TestPluginFactory({
						slug: 'test-plugin-2',
						name: 'Test Plugin 2',
						actions: [
							Object.assign({}, action2, {
								card: {
									slug: action1.card.slug,
								},
							}),
						],
					}),
				],
			});

			const getActions = () => pluginManager.getActions(context);

			expect(getActions).toThrow(
				"Action 'action-1' already exists and cannot be loaded from plugin 'Test Plugin 2'",
			);
		});

		test('returns a dictionary of actions keyed by slug', () => {
			const pluginManager = new PluginManager(context, {
				plugins: [
					TestPluginFactory({
						slug: 'test-plugin-1',
						actions: [action1],
					}),

					TestPluginFactory({
						slug: 'test-plugin-2',
						actions: [action2],
					}),
				],
			});

			const loadedActions = pluginManager.getActions(context);

			expect(loadedActions).toEqual({
				'action-1': {
					handler: action1.handler,
					pre: action1.pre || _.noop,
				},
				'action-2': {
					handler: action2.handler,
					pre: action2.pre || _.noop,
				},
			});
		});
	});
});
