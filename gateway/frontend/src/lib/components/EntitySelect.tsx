import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTrigger } from '../toolkit/useTrigger';
import { AdvancedSelect as AS, AdvancedSelectProps, AdvancedOption } from './Select';
import { Pager, PagerProps, pagerLayout } from './Pager';

const AdvancedSelect = styled(AS)`
  ${pagerLayout.SubmitButton} {
    border: none;

    &::before,
    &::after,
    & > i {
      display: none;
    }
  }
  ${pagerLayout.Container} {
    & > ${pagerLayout.Item}:not(:last-child) {
      margin-bottom: 0;
    }
  }
  ${pagerLayout.Item} {
    cursor: pointer;
    margin-bottom: 0;
  }
`;

export interface EntitySelectProps<T>
  extends Omit<AdvancedSelectProps, 'children' | 'value'>,
    Omit<PagerProps<T>, 'renderItem'> {
  valueGetter(item: T): string;
  value: string[] | ((entities: T[]) => string[]);
  renderItem?: (item: T, origin: React.ReactNode) => React.ReactNode;
}

export const EntitySelect = <T extends {}>({
  size,
  fetch,
  verbose,
  valueGetter,
  value: propValue,
  renderItem = (_, origin) => origin,
  ...p
}: EntitySelectProps<T>) => {
  // FIXME bad practice
  const [entities, setEntities] = useState<T[]>([]);

  const value = useMemo(() => {
    if (Array.isArray(propValue)) {
      return propValue;
    }
    return propValue(entities);
  }, [entities, propValue]);

  useTrigger(
    () => {
      if (entities.length != 1 || size == 1) {
        return;
      }

      p.onChange(valueGetter(entities[0]), entities[0]);
    },
    entities[0],
    [entities, size, p.onChange, valueGetter],
  );

  return (
    <AdvancedSelect {...p} value={value}>
      <Pager
        size={size}
        fetch={fetch}
        renderItem={(item: T) =>
          renderItem(item, <AdvancedOption value={valueGetter(item)} obj={item} />)
        }
        verbose={verbose}
        onEntitiesChanged={setEntities}
      />
    </AdvancedSelect>
  );
};
