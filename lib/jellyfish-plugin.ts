/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import { INTERFACE_VERSION } from './version';

export interface Mixins {
	mixin: (mixins: Card[]) => (card: Card) => Card;
	initialize: (card: Card) => Card;
}

export interface Card {
	id: string;
	slug: string;
	[key: string]: string | object | null | undefined;
}

export type CardFileFn = (mixins: Mixins) => Card;

export type CardFile = Card | CardFileFn;

interface Map<T> {
	[key: string]: T;
}

export interface JellyfishPluginOptions {
	cards?: CardFile[];
	mixins?: Map<CardFile>;
	integrations?: Integration[];
}

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

export interface PluginIdentity {
	slug: string;
	version: string;
}

const getSafeMap = <T extends { slug: string }>(
	source: any[],
	sourceType: string,
	resolver: (item: any) => T = _.identity,
): Map<T> => {
	return _.reduce(
		source,
		(map: Map<T>, item: T) => {
			const resolvedItem = resolver(item);
			if (map[resolvedItem.slug]) {
				throw new Error(
					`Duplicate ${sourceType} with slug '${resolvedItem.slug}' found`,
				);
			}
			map[resolvedItem.slug] = resolvedItem;
			return map;
		},
		{},
	);
};

export abstract class JellyfishPlugin {
	abstract slug: string;
	abstract name: string;
	abstract version: string;
	abstract requires: PluginIdentity[];

	interfaceVersion: string;

	private _cardFiles: CardFile[];
	private _mixins: Map<CardFile>;
	private _integrations: Integration[];

	constructor(options: JellyfishPluginOptions) {
		this.interfaceVersion = INTERFACE_VERSION;
		this._cardFiles = options.cards || [];
		this._mixins = options.mixins || {};
		this._integrations = options.integrations || [];
	}

	getCards(mixins: Mixins) {
		return getSafeMap<Card>(this._cardFiles, 'cards', (cardFile: CardFile) => {
			const cardMixins = {
				...mixins,
				...this._mixins,
			};
			const card =
				typeof cardFile === 'function' ? cardFile(cardMixins) : cardFile;
			return mixins.initialize(card);
		});
	}

	getSyncIntegrations() {
		return getSafeMap<Integration>(this._integrations, 'integrations');
	}
}
