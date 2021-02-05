/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import sinon from 'sinon';
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
	id: 'jellyfish-plugin-test',
};

describe('JellyfishPlugin', () => {
	describe('validates the plugin', () => {
		test('by throwing an exception if the plugin does not implement the required interface', () => {
			const getPlugin = () =>
				new (TestPluginFactory({
					slug: 'Invalid slug',
				}))();
			expect(getPlugin).toThrow(/data\.slug should match pattern/);
		});

		test('but will not throw an exception if the plugin specifies a beta version', () => {
			const getPlugin = () =>
				new (TestPluginFactory({
					version: '1.0.0-some-beta-version',
				}))();
			expect(getPlugin).not.toThrow();
		});
	});

	describe('.interfaceVersion', () => {
		test('returns the value of INTERFACE_VERSION', () => {
			const plugin = new (TestPluginFactory({}))();
			expect(plugin.interfaceVersion).toBe(INTERFACE_VERSION);
		});
	});

	describe('.getCards', () => {
		test('returns an empty object if no cards are supplied to the plugin', () => {
			const plugin = new (TestPluginFactory({}))();
			const cards = plugin.getCards(context, mixins);
			expect(cards).toEqual({});
		});

		test('throws an exception if duplicate card slugs are found', () => {
			const plugin = new (TestPluginFactory({
				cards: [card1, Object.assign({}, card2, { slug: card1.slug })],
			}))();

			const getCards = () => plugin.getCards(context, mixins);

			expect(getCards).toThrow("Duplicate cards with slug 'card-1' found");
		});

		test('throws an exception if duplicate action slugs are found', () => {
			const plugin = new (TestPluginFactory({
				cards: [card1],
				actions: [
					action1,
					Object.assign({}, action2, {
						card: {
							slug: action1.card.slug,
						},
					}),
				],
			}))();

			const getCards = () => plugin.getCards(context, mixins);

			expect(getCards).toThrow("Duplicate cards with slug 'action-1' found");
		});

		test('passes mixins to any card provided as a function', () => {
			const cardFunction = sinon.stub().returns(card1);
			const testMixin = _.identity;

			const plugin = new (TestPluginFactory({
				cards: [cardFunction],
				mixins: {
					test: testMixin,
				},
			}))();

			const cards = plugin.getCards(context, mixins);

			expect(cardFunction.calledOnce).toBe(true);
			expect(cardFunction.firstCall.firstArg.test).toBe(testMixin);
			expect(cards).toEqual({
				'card-1': card1,
			});
		});

		test('returns a dictionary of cards, keyed by slug', () => {
			const plugin = new (TestPluginFactory({
				cards: [
					// Cards can be passed in as objects:
					card1,
					// ...or as a function that returns a card
					({ mixin }) => mixin([])(card2),
				],
			}))();

			const initializeSpy = sinon.spy(mixins, 'initialize');
			const mixinSpy = sinon.spy(mixins, 'mixin');

			const cards = plugin.getCards(context, mixins);

			expect(mixinSpy.callCount).toBe(1);
			expect(initializeSpy.callCount).toBe(2);
			expect(initializeSpy.getCall(0).firstArg).toEqual(card1);
			expect(initializeSpy.getCall(1).firstArg).toEqual(card2);
			expect(cards).toEqual({
				'card-1': card1,
				'card-2': card2,
			});
		});
	});

	describe('.getSyncIntegrations', () => {
		test('returns an empty object if no integrations are supplied to the plugin', () => {
			const plugin = new (TestPluginFactory({}))();
			const loadedIntegrations = plugin.getSyncIntegrations(context);
			expect(loadedIntegrations).toEqual({});
		});

		test('throws an exception if duplicate integration slugs are found', () => {
			const plugin = new (TestPluginFactory({
				integrations: [
					integration1,
					Object.assign({}, integration2, { slug: integration1.slug }),
				],
			}))();

			const getSyncIntegrations = () => plugin.getSyncIntegrations(context);

			expect(getSyncIntegrations).toThrow(
				"Duplicate integrations with slug 'integration-1' found",
			);
		});

		test('returns a dictionary of integrations keyed by slug', () => {
			const plugin = new (TestPluginFactory({
				integrations: [integration1, integration2],
			}))();

			const loadedIntegrations = plugin.getSyncIntegrations(context);

			expect(loadedIntegrations).toEqual({
				'integration-1': integration1,
				'integration-2': integration2,
			});
		});
	});

	describe('.getActions', () => {
		test('returns an empty object if no actions are supplied to the plugin', () => {
			const plugin = new (TestPluginFactory({}))();
			const loadedActions = plugin.getActions(context);
			expect(loadedActions).toEqual({});
		});

		test('returns a dictionary of actions keyed by slug', () => {
			const plugin = new (TestPluginFactory({
				actions: [action1, action2],
			}))();

			const loadedActions = plugin.getActions(context);

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
