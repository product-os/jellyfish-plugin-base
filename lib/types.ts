/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import type {
	Contract,
	ContractSummary,
	ContractDefinition,
} from '@balena/jellyfish-types/build/core';

export interface Map<T> {
	[key: string]: T;
}

export type Sluggable = { slug: string } | { card: Contract };

export interface CoreMixins {
	mixin: (mixins: Contract[]) => (card: Contract) => Contract;
	initialize: (card: ContractDefinition) => Contract;
}

export interface Contracts extends Map<Contract> {}

export type ContractFileFn = (mixins: CoreMixins) => ContractDefinition;

export type ContractFile = ContractDefinition | ContractFileFn;

export interface ContractFiles extends Map<ContractFile> {}

export interface IntegrationEvent {
	data: any;
}

export interface IntegrationResult {
	time: Date;
	actor: string;
	card: ContractDefinition;
}

export interface Integration {
	slug: string;
	initialize: () => Promise<void>;
	destroy: () => Promise<void>;
	mirror: (card: Contract, options: any) => Promise<IntegrationResult[]>;
	translate: (event: IntegrationEvent) => Promise<IntegrationResult[]>;
}

export interface Integrations extends Map<Integration> {}

// TS-TODO: Define more strict return type that matches reality
type ActionPreFn = (session: any, context: any, request: any) => any;

interface ActionCore {
	handler: (
		session: any,
		context: any,
		card: Contract,
		request: any,
	) => Promise<null | ContractSummary | ContractSummary[]>;
}

interface Action extends ActionCore {
	pre: ActionPreFn;
}

export interface ActionFile extends ActionCore {
	pre?: ActionPreFn;
	card: ContractDefinition;
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

	getCards: (context: object, mixins: CoreMixins) => Contracts;
	getSyncIntegrations: (context: object) => Integrations;
	getActions: (context: object) => Actions;
}

export interface JellyfishPlugins extends Map<JellyfishPlugin> {}

export type JellyfishPluginConstructor = new () => JellyfishPlugin;

export interface PluginManagerOptions {
	plugins: JellyfishPluginConstructor[];
}
