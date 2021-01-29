/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import {
	JellyfishPluginBase,
	Card,
	CardFile,
	CardFiles,
	Integration,
	PluginIdentity,
	JellyfishPluginConstructor,
	JellyfishPluginOptions,
} from '../lib';

export const mixins = {
	initialize: _.identity,
	mixin: () => _.identity,
};

export const card1: Card = {
	id: '1',
	slug: 'card-1',
};

export const card2: Card = {
	id: '2',
	slug: 'card-2',
};

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

export const integration1 = new TestIntegration('integration-1');
export const integration2 = new TestIntegration('integration-2');

interface TestJellyfishPluginOptions {
	slug?: string;
	name?: string;
	version?: string;
	interfaceVersion?: string;
	requires?: PluginIdentity[];
	cards?: CardFile[];
	mixins?: CardFiles;
	integrations?: Integration[];
}

export const TestPluginFactory = (
	options: TestJellyfishPluginOptions,
): JellyfishPluginConstructor => {
	const pluginOptions: JellyfishPluginOptions = _.defaults({}, options, {
		slug: 'test-plugin',
		name: 'Test Plugin',
		version: '1.0.0',
	});

	class TestPlugin extends JellyfishPluginBase {
		constructor() {
			super(pluginOptions);
			this.interfaceVersion = options.interfaceVersion || this.interfaceVersion;
		}
	}

	return TestPlugin;
};
