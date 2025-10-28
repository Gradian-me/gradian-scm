// Card Types

import { BaseComponentProps } from '../../../shared/types';
import { KeyboardEvent } from 'react';

export interface CardProps extends BaseComponentProps {
  config: CardConfig;
  children?: React.ReactNode;
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
}

export interface CardConfig {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  actions?: CardAction[];
  metadata?: Record<string, any>;
  styling?: {
    variant?: 'default' | 'minimal' | 'elevated' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    rounded?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    border?: boolean;
  };
  behavior?: {
    clickable?: boolean;
    hoverable?: boolean;
    selectable?: boolean;
    draggable?: boolean;
  };
  layout?: {
    direction?: 'vertical' | 'horizontal';
    alignment?: 'start' | 'center' | 'end' | 'stretch';
    spacing?: 'compact' | 'normal' | 'relaxed';
  };
}

export interface CardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
}

export interface CardContentProps extends BaseComponentProps {
  children: React.ReactNode;
  padding?: boolean;
}

export interface CardFooterProps extends BaseComponentProps {
  actions?: CardAction[];
  children?: React.ReactNode;
  alignment?: 'left' | 'center' | 'right' | 'between';
}

export interface CardImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

export interface CardWrapperProps extends BaseComponentProps {
  config: CardConfig;
  children: React.ReactNode;
  onKeyDown?: (e: KeyboardEvent) => void;
}