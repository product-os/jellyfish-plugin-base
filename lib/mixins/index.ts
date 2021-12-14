import type { ExtraMixins } from '../types';
import { asPipelineItem } from './as-pipeline-item';
import { withEvents } from './with-events';

function uiSchemaDef(key: string): string {
	return `node_modules/@balena/jellyfish-core/build/cards/mixins/ui-schema-defs.json#/${key}`;
}

export const mixins: ExtraMixins = {
	uiSchemaDef,
	asPipelineItem,
	withEvents: withEvents({
		uiSchemaDef,
	}),
};
