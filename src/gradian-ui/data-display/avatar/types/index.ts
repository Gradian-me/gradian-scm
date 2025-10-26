// Avatar Types

import { BaseComponentProps } from '../../../shared/types';

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}
