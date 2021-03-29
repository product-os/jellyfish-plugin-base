/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import type {
	Contract,
	ContractSummary,
	ContractDefinition,
	ContractData,
	Context,
	ActionRequestContract,
} from '@balena/jellyfish-types/build/core';

export interface Map<T> {
	[key: string]: T;
}

export type Sluggable = { slug: string } | { card: Contract };

export interface CoreMixins {
	mixin: (
		mixins: Contract[],
	) => <TData = ContractData>(card: Contract<TData>) => Contract<TData>;
	initialize: <TData = ContractData>(
		card: ContractDefinition<TData>,
	) => Contract<TData>;
}

export interface ExtraMixins {
	[key: string]: any;
}

export interface Mixins extends CoreMixins, ExtraMixins {}

export interface Contracts extends Map<Contract> {}

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

export interface Integration<TData = ContractData> {
	slug: string;
	initialize: () => Promise<void>;
	destroy: () => Promise<void>;
	mirror: (
		card: Contract<TData>,
		options: any,
	) => Promise<Array<IntegrationResult<TData>>>;
	translate: (
		event: IntegrationEvent,
	) => Promise<Array<IntegrationResult<TData>>>;
}

export interface Integrations extends Map<Integration> {}

type ActionPreFn = (
	session: string,
	context: Context,
	request: ActionRequestContract,
) => Promise<void> | void;

interface ActionCore<TData = ContractData> {
	handler: (
		session: string,
		context: Context,
		card: Contract<TData>,
		request: ActionRequestContract,
	) => Promise<null | ContractSummary<TData>>;
}

interface Action<TData = ContractData> extends ActionCore<TData> {
	pre: ActionPreFn;
}

export interface ActionFile<TData = ContractData> extends ActionCore<TData> {
	pre?: ActionPreFn;
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
