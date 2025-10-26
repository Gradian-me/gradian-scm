// Avatar utilities
export {
  getInitials,
  getAvatarContent,
} from './avatar-utils';

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
} from './badge-utils';
export type { BadgeOption, BadgeMetadata, BadgeColor, BadgeConfig } from './badge-utils';

// Rating utilities
export {
  renderRatingStars,
} from './rating-utils';

// Field resolver utilities
export {
  getFieldsByRole,
  getValueByRole,
  getSingleValueByRole,
  resolveFieldById,
  getFieldValue,
} from './field-resolver';

