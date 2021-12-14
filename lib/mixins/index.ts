import type { ExtraMixins } from '../types';
import { asPipelineItem } from './as-pipeline-item';
import { withEvents } from './with-events';
import { uiSchemaDef } from './ui-schema-def';

export const mixins: ExtraMixins = {
	uiSchemaDef,
	asPipelineItem,
	withEvents,
};
