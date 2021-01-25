/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import sinon from 'sinon';
import {
	Card,
	Integration,
	IntegrationEvent,
	JellyfishPlugin,
	JellyfishPluginOptions,
} from '../lib/jellyfish-plugin';
import { INTERFACE_VERSION } from '../lib/version';

describe('JellyfishPlugin', () => {
	class TestPlugin extends JellyfishPlugin {
		slug = 'test-plugin';
		name = 'Test Plugin';
		version = '1.0.0';
		requires = [];

		constructor(options: JellyfishPluginOptions) {
			super(options);
		}
	}
	const card1: Card = {
		id: '1',
		slug: 'card-1',
	};
	const card2: Card = {
		id: '2',
		slug: 'card-2',
	};

	describe('.interfaceVersion', () => {
		test('returns the value of INTERFACE_VERSION', () => {
			const plugin = new TestPlugin({});
			expect(plugin.interfaceVersion).toBe(INTERFACE_VERSION);
		});
	});

	describe('.getCards', () => {
		const mixins = {
			initialize: _.identity,
			mixin: () => _.identity,
		};

		test('returns an empty object if no cards are supplied to the plugin', () => {
			const plugin = new TestPlugin({});
			const cards = plugin.getCards(mixins);
			expect(cards).toEqual({});
		});

		test('throws an exception if duplicate card slugs are found', () => {
			const plugin = new TestPlugin({
				cards: [card1, Object.assign({}, card2, { slug: card1.slug })],
			});

			const getCards = () => plugin.getCards(mixins);

			expect(getCards).toThrow("Duplicate cards with slug 'card-1' found");
		});

		test('passes mixins to any card provided as a function', () => {
			const cardFunction = sinon.stub().returns(card1);
			const testMixin = _.identity;

			const plugin = new TestPlugin({
				cards: [cardFunction],
				mixins: {
					test: testMixin,
				},
			});

			const cards = plugin.getCards(mixins);

			expect(cardFunction.calledOnce).toBe(true);
			expect(cardFunction.firstCall.firstArg.test).toBe(testMixin);
			expect(cards).toEqual({
				'card-1': card1,
			});
		});

		test('returns a dictionary of cards, keyed by slug', () => {
			const plugin = new TestPlugin({
				cards: [
					// Cards can be passed in as objects:
					card1,
					// ...or as a function that returns a card
					({ mixin }) => mixin([])(card2),
				],
			});

			const initializeSpy = sinon.spy(mixins, 'initialize');
			const mixinSpy = sinon.spy(mixins, 'mixin');

			const cards = plugin.getCards(mixins);

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
		class TestIntegration implements Integration {
			slug: string;

			constructor(slug: string) {
				this.slug = slug;
			}

			async initialize() {
				return Promise.resolve();
			}

			async destroy() {
				return Promise.resolve();
			}

			// @ts-ignore
			async mirror(card: Card, options: any) {
				return Promise.resolve([]);
			}

			// @ts-ignore
			async translate(event: IntegrationEvent) {
				return Promise.resolve([]);
			}
		}

		const integration1 = new TestIntegration('integration-1');
		const integration2 = new TestIntegration('integration-2');

		test('returns an empty object if no integrations are supplied to the plugin', () => {
			const plugin = new TestPlugin({});
			const loadedIntegrations = plugin.getSyncIntegrations();
			expect(loadedIntegrations).toEqual({});
		});

		test('throws an exception if duplicate integration slugs are found', () => {
			const plugin = new TestPlugin({
				integrations: [
					integration1,
					Object.assign({}, integration2, { slug: integration1.slug }),
				],
			});

			const getSyncIntegrations = () => plugin.getSyncIntegrations();

			expect(getSyncIntegrations).toThrow(
				"Duplicate integrations with slug 'integration-1' found",
			);
		});

		test('returns a dictionary of integrations keyed by slug', () => {
			const plugin = new TestPlugin({
				integrations: [integration1, integration2],
			});

			const loadedIntegrations = plugin.getSyncIntegrations();

			expect(loadedIntegrations).toEqual({
				'integration-1': integration1,
				'integration-2': integration2,
			});
		});
	});
});
