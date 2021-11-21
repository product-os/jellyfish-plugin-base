import type {
	Contract,
	ContractDefinition,
	ContractData,
	Context,
} from '@balena/jellyfish-types/build/core';
import type { Action } from '@balena/jellyfish-types/build/worker';

export interface Map<T> {
	[key: string]: T;
}

export type Sluggable = { slug: string } | { card: Contract };

// TS-TODO: Replace this with the type directly from jellyfish-core once it's fully converted to TS
export interface CoreMixins {
	mixin: (
		...mixins: ContractDefinition[]
	) => <TData = ContractData>(
		card: ContractDefinition<TData>,
	) => ContractDefinition<TData>;
	initialize: <TData = ContractData>(
		card: ContractDefinition<TData>,
	) => ContractDefinition<TData>;
}

export interface ExtraMixins {
	[key: string]: any;
}

export interface Mixins extends CoreMixins, ExtraMixins {}

export interface Contracts extends Map<ContractDefinition> {}

export type ContractFileFn<TData = ContractData> = (
	mixins: CoreMixins,
) => ContractDefinition<TData>;

export type ContractFile<TData = ContractData> =
	| ContractDefinition<TData>
	| ContractFileFn<TData>;

export interface ContractFiles extends Map<ContractFile> {}

export interface IntegrationEvent {
	data: any;
}

export interface IntegrationResult<TData> {
	time: Date;
	actor: string;
	card: ContractDefinition<TData>;
}

export interface SyncFunctionOptions {
	actor: string;
}

export interface Integration<TData = ContractData> {
	slug: string;
	initialize: () => Promise<void>;
	destroy: () => Promise<void>;
	mirror: (
		card: Contract<TData>,
		options: SyncFunctionOptions,
	) => Promise<Array<IntegrationResult<TData>>>;
	translate: (
		event: IntegrationEvent,
		options?: SyncFunctionOptions,
	) => Promise<Array<IntegrationResult<TData>>>;
}

export interface Integrations extends Map<Integration> {}

interface ActionCore {
	handler: Action['handler'];
}

export interface ActionFile<TData = ContractData> extends ActionCore {
	pre?: Action['pre'];
	card: ContractDefinition<TData>;
}

export interface Actions extends Map<Action> {}

export interface PluginIdentity {
	slug: string;
	version: string;
}

export interface JellyfishPluginOptions {
	slug: string;
	name: string;
	version: string;
	requires?: PluginIdentity[];
	cards?: ContractFile[];
	mixins?: ContractFiles;
	integrations?: Integration[];
	actions?: ActionFile[];
}

export interface JellyfishPlugin {
	slug: string;
	name: string;
	version: string;
	interfaceVersion: string;
	requires: PluginIdentity[];

	getCards: (context: Context, mixins: CoreMixins) => Contracts;
	getSyncIntegrations: (context: Context) => Integrations;
	getActions: (context: Context) => Actions;
}

export interface JellyfishPlugins extends Map<JellyfishPlugin> {}

export type JellyfishPluginConstructor = new () => JellyfishPlugin;

export interface PluginManagerOptions {
	plugins: JellyfishPluginConstructor[];
}
