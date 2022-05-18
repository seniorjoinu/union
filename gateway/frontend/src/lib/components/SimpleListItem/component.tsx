import * as React from 'react';
import { Container, Cell } from './styles';
import { DefaultSimpleListItem, SimpleListItemProps, Order } from './types';

export const SimpleListItem = <T extends DefaultSimpleListItem>({
  className,
  style,
  item,
  order = itemKeysToOrder(item),
  variant = 'outlined',
  onClick,
}: SimpleListItemProps<T>): JSX.Element => {
  const handleClick = React.useCallback((e: React.MouseEvent) => onClick && onClick(e, item), [
    onClick,
    item,
  ]);

  return (
    <Container
      id={item.id.toString().toLowerCase()}
      className={className}
      style={style}
      onClick={handleClick}
      isInteractive={!!onClick}
      variant={variant}
    >
      {order.map(({ key, basis, align = 'start' }) => (
        <Cell key={`${key}`} basis={basis} align={align}>
          {item[key]}
        </Cell>
      ))}
    </Container>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-types
const itemKeysToOrder = <T extends DefaultSimpleListItem>(item: T): Order<T>[] =>
  getKeys(item).map((key) => ({
    key,
    basis: 'auto',
    align: 'start',
    size: 'L',
    variant: 'outlined',
  }));

export const getKeys = <T extends Record<string, unknown>>(obj: T): Array<keyof T> =>
  Object.keys(obj) as Array<keyof T>;
