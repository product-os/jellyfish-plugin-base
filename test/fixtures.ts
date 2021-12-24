import _ from 'lodash';
import type { Contract } from '@balena/jellyfish-types/build/core';
import type {
	ActionFile,
	ContractFile,
	ContractFiles,
	Integration,
	PluginIdentity,
	JellyfishPluginConstructor,
	JellyfishPluginOptions,
	IntegrationEvent,
} from '../lib';
import { JellyfishPluginBase } from '../lib';

const commonCard = {
	tags: [],
	markers: [],
	links: {},
	created_at: '2021-03-18T23:29:51.132Z',
	active: true,
	data: {},
	requires: [],
	capabilities: [],
};

export const mixins = {
	initialize: _.identity,
	mixin: () => _.identity,
};

export const card1: Contract = {
	...commonCard,
	id: '1',
	slug: 'card-1',
	type: 'card',
	version: '1.0.0',
};

export const card2: Contract = {
	...commonCard,
	id: '2',
	slug: 'card-2',
	type: 'card',
	version: '1.0.0',
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

	async mirror(_contract: Contract, _options: any) {
		return Promise.resolve([]);
	}

	async translate(_event: IntegrationEvent) {
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
	cards?: ContractFile[];
	mixins?: ContractFiles;
	integrations?: Integration[];
	actions?: ActionFile[];
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

export const action1: ActionFile = {
	card: {
		slug: 'action-1',
		type: 'action',
		data: {},
	},
	handler: async () => null,
};

export const action2: ActionFile = {
	card: {
		slug: 'action-2',
		type: 'action',
		data: {},
	},
	pre: _.noop,
	handler: async () => _.pick(card1, 'id', 'slug', 'type', 'version'),
};
