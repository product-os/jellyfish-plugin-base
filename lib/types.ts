/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

export interface Map<T> {
	[key: string]: T;
}

export type Sluggable = { slug: string } | { card: Card };

export interface CoreMixins {
	mixin: (mixins: Card[]) => (card: Card) => Card;
	initialize: (card: CardBase) => Card;
}

export interface CardBase {
	slug: string;
	type: string;
	[key: string]: string | object | null | undefined;
}

export interface CardSummary {
	id: string;
	slug: string;
	version: string;
	type: string;
}

export interface Card extends CardSummary {
	[key: string]: string | object | null | undefined;
}

export interface Cards extends Map<Card> {}

export type CardFileFn = (mixins: CoreMixins) => CardBase;

export type CardFile = CardBase | CardFileFn;

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

type ActionPreFn = (session: any, context: any, request: any) => void;

interface ActionCore {
	handler: (
		session: any,
		context: any,
		card: Card,
		request: any,
	) => Promise<null | CardSummary>;
}

interface Action extends ActionCore {
	pre: ActionPreFn;
}

export interface ActionFile extends ActionCore {
	pre?: ActionPreFn;
	card: CardBase;
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
	cards?: CardFile[];
	mixins?: CardFiles;
	integrations?: Integration[];
	actions?: ActionFile[];
}

export interface JellyfishPlugin {
	slug: string;
	name: string;
	version: string;
	interfaceVersion: string;
	requires: PluginIdentity[];

	getCards: (context: object, mixins: CoreMixins) => Cards;
	getSyncIntegrations: (context: object) => Integrations;
	getActions: (context: object) => Actions;
}

export interface JellyfishPlugins extends Map<JellyfishPlugin> {}

export type JellyfishPluginConstructor = new () => JellyfishPlugin;

export interface PluginManagerOptions {
	plugins: JellyfishPluginConstructor[];
}
