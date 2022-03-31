import * as React from 'react';

export type DefaultSimpleListItem = { id: string | number };

export interface Order<T extends DefaultSimpleListItem> {
  key: keyof T;
  basis?: string;
  align?: 'start' | 'end';
}

// FIXME order: если использовать Order то styled ломает этот Generic в файле ../component.tsx
export interface SimpleListItemProps<T extends DefaultSimpleListItem> {
  className?: string;
  style?: React.CSSProperties;
  item: T;
  order?: { key: keyof T; basis?: string; align?: 'start' | 'end' | 'center' }[];
  variant?: 'outlined' | 'contained';
  onClick?(e: React.MouseEvent, item: T): void;
}

export type SimpleListItemComponentType = <T extends DefaultSimpleListItem>(
  p: SimpleListItemProps<T>,
) => React.ReactElement;
