// Field resolution utilities
export {
  getFieldsByRole,
  getValueByRole,
  getSingleValueByRole,
  resolveFieldById,
  getFieldValue,
  getArrayValuesByRole,
  getMetricsByRole,
} from '../../form-builder/form-elements/utils/field-resolver';

// Badge utilities
export {
  findBadgeOption,
  getBadgeColor,
  getBadgeIcon,
  getBadgeLabel,
  getBadgeMetadata,
  getBadgeConfig,
  getStatusColor,
  getStatusIcon,
  getStatusMetadata,
  findStatusFieldOptions,
} from '../../form-builder/form-elements/utils/badge-utils';
export type { BadgeOption, BadgeMetadata, BadgeColor, BadgeConfig } from '../../form-builder/form-elements/utils/badge-utils';

// Avatar utilities
export {
  getInitials,
  getAvatarContent,
} from '../../form-builder/form-elements/utils/avatar-utils';

// Card renderers
export {
  renderCardSection,
} from './card-section-renderer';

export {
  renderFieldValue,
} from './card-field-renderer';

export {
  renderCardSection as renderSection,
} from './card-renderer';

// Rating utilities
export {
  renderRatingStars,
} from '../../form-builder/form-elements/utils/rating-utils';

