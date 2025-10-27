// Grid Builder Types

import { BaseComponentProps } from '../../../shared/types';

export interface GridBuilderProps extends BaseComponentProps {
  config: GridConfig;
  children: React.ReactNode;
}

export interface GridConfig {
  id: string;
  name: string;
  columns: number | {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap: number;
  padding?: number;
  margin?: number;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  responsive?: boolean;
  autoFit?: boolean;
  autoFill?: boolean;
  minColumnWidth?: number;
  maxColumnWidth?: number;
  alignment?: {
    horizontal?: 'start' | 'center' | 'end' | 'stretch';
    vertical?: 'start' | 'center' | 'end' | 'stretch';
  };
}

export interface GridItemProps extends BaseComponentProps {
  config: GridItemConfig;
  children: React.ReactNode;
}

export interface GridItemConfig {
  id: string;
  name: string;
  columnStart?: number;
  columnEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  span?: {
    columns?: number;
    rows?: number;
  };
  order?: number;
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  breakpoints?: {
    sm?: Partial<GridItemConfig>;
    md?: Partial<GridItemConfig>;
    lg?: Partial<GridItemConfig>;
    xl?: Partial<GridItemConfig>;
  };
}

export interface GridAreaProps extends BaseComponentProps {
  config: GridAreaConfig;
  children: React.ReactNode;
}

export interface GridAreaConfig {
  id: string;
  name: string;
  area: string;
  gridTemplate?: {
    columns?: string;
    rows?: string;
    areas?: string;
  };
  gap?: number;
  padding?: number;
  margin?: number;
}

export interface GridContainerProps extends BaseComponentProps {
  config: GridConfig;
  children: React.ReactNode;
}

export interface GridRowProps extends BaseComponentProps {
  config: GridRowConfig;
  children: React.ReactNode;
}

export interface GridRowConfig {
  id: string;
  name: string;
  columns: number;
  gap: number;
  alignment?: {
    horizontal?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    vertical?: 'start' | 'center' | 'end' | 'stretch';
  };
  wrap?: boolean;
  reverse?: boolean;
}

export interface GridColumnProps extends BaseComponentProps {
  config: GridColumnConfig;
  children: React.ReactNode;
}

export interface GridColumnConfig {
  id: string;
  name: string;
  span?: number;
  offset?: number;
  order?: number;
  alignment?: {
    horizontal?: 'start' | 'center' | 'end' | 'stretch';
    vertical?: 'start' | 'center' | 'end' | 'stretch';
  };
  breakpoints?: {
    sm?: Partial<GridColumnConfig>;
    md?: Partial<GridColumnConfig>;
    lg?: Partial<GridColumnConfig>;
    xl?: Partial<GridColumnConfig>;
  };
}
