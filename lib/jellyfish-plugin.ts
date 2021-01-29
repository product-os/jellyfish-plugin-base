/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash';
import skhema from 'skhema';
import { JSONSchema6 } from 'json-schema';
import { getLogger } from '@balena/jellyfish-logger';
import { INTERFACE_VERSION } from './version';
import {
	Map,
	CardFiles,
	JellyfishPlugin,
	PluginIdentity,
	CardFile,
	Integration,
	JellyfishPluginOptions,
	CoreMixins,
	Card,
} from './types';

const logger = getLogger(__filename);

const pluginOptionsSchema: JSONSchema6 = {
	type: 'object',
	required: ['slug', 'name', 'version'],
	properties: {
		slug: {
			type: 'string',
			pattern: '^[a-z0-9-]+$',
		},
		name: {
			type: 'string',
		},
		version: {
			type: 'string',
			pattern: '^\\d+(\\.\\d+)?(\\.\\d+)?(-[\\w\\d-]*)?$',
		},
	},
};

export abstract class JellyfishPluginBase implements JellyfishPlugin {
	slug: string;
	name: string;
	version: string;
	requires: PluginIdentity[];
	interfaceVersion: string;

	private _cardFiles: CardFile[];
	private _mixins: CardFiles;
	private _integrations: Integration[];

	protected constructor(options: JellyfishPluginOptions) {
		skhema.validate(pluginOptionsSchema, options);
		this.slug = options.slug;
		this.name = options.name;
		this.version = options.version;
		this.requires = options.requires || [];
		this.interfaceVersion = INTERFACE_VERSION;
		this._cardFiles = options.cards || [];
		this._mixins = options.mixins || {};
		this._integrations = options.integrations || [];
	}

	private getSafeMap<T extends { slug: string }>(
		context: object,
		source: any[],
		sourceType: string,
		resolver: (item: any) => T = _.identity,
	): Map<T> {
		return _.reduce(
			source,
			(map: Map<T>, item: T) => {
				const resolvedItem = resolver(item);
				if (map[resolvedItem.slug]) {
					const errorMessage = `Duplicate ${sourceType} with slug '${resolvedItem.slug}' found`;
					logger.error(context, `${this.name}: ${errorMessage}`);
					throw new Error(errorMessage);
				}
				map[resolvedItem.slug] = resolvedItem;
				return map;
			},
			{},
		);
	}

	getCards(context: object, mixins: CoreMixins) {
		return this.getSafeMap<Card>(
			context,
			this._cardFiles,
			'cards',
			(cardFile: CardFile) => {
				const cardMixins = {
					...mixins,
					...this._mixins,
				};
				const card =
					typeof cardFile === 'function' ? cardFile(cardMixins) : cardFile;
				return mixins.initialize(card);
			},
		);
	}

	getSyncIntegrations(context: object) {
		return this.getSafeMap<Integration>(
			context,
			this._integrations,
			'integrations',
		);
	}
}
