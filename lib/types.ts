/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

export interface Map<T> {
	[key: string]: T;
}

export interface CoreMixins {
	mixin: (mixins: Card[]) => (card: Card) => Card;
	initialize: (card: Card) => Card;
}

export interface Card {
	id: string;
	slug: string;
	[key: string]: string | object | null | undefined;
}

export interface Cards extends Map<Card> {}

export type CardFileFn = (mixins: CoreMixins) => Card;

export type CardFile = Card | CardFileFn;

export interface CardFiles extends Map<CardFile> {}

export interface IntegrationEvent {
	data: object;
}

export interface IntegrationResult {
	time: Date;
	actor: string;
	card: Card;
}

export interface Integration {
	slug: string;
	initialize: () => Promise<void>;
	destroy: () => Promise<void>;
	mirror: (card: Card, options: any) => Promise<IntegrationResult[]>;
	translate: (event: IntegrationEvent) => Promise<IntegrationResult[]>;
}

export interface Integrations extends Map<Integration> {}

export interface PluginIdentity {
	slug: string;
	version: string;
}

export interface JellyfishPluginOptions {
	slug: string;
	name: string;
	version: string;
	requires?: PluginIdentity[];
	cards?: CardFile[];
	mixins?: CardFiles;
	integrations?: Integration[];
}

export interface JellyfishPlugin {
	slug: string;
	name: string;
	version: string;
	interfaceVersion: string;
	requires: PluginIdentity[];

	getCards: (context: object, mixins: CoreMixins) => Cards;
	getSyncIntegrations: (context: object) => Integrations;
}

export interface JellyfishPlugins extends Map<JellyfishPlugin> {}

export type JellyfishPluginConstructor = new () => JellyfishPlugin;

export interface PluginManagerOptions {
	plugins: JellyfishPluginConstructor[];
}
