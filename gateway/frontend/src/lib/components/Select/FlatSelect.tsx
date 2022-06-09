import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { Checkbox } from '../Checkbox';
import { Column, Row } from '../Layout';
import { withBorder } from '../withBorder';

const Children = styled(Column)``;
const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 8px;

  & > * {
    flex-grow: 1;
  }
`;
const Item = styled(
  withBorder(
    styled(Row)`
      cursor: pointer;
      padding: 8px;
      align-items: flex-start;
    `,
    { quadFillColor: 'rgba(0, 0, 0, 0)' },
  ),
)<{ $checked: boolean }>`
  transition: opacity 0.3s ease;
  opacity: ${({ $checked }) => ($checked ? '1' : '0.6')};

  &:hover {
    opacity: 1;
  }
`;
const Container = styled.div<{ $align: 'column' | 'row'; $readonly: boolean }>`
  display: flex;
  flex-wrap: wrap;

  &&& > * {
    flex-basis: ${({ $align }) => ($align == 'row' ? '50%' : '100%')};
    margin-right: 0;
    margin-bottom: 0;
  }

  ${Item} {
    ${({ $readonly }) =>
      ($readonly
        ? css`
            opacity: 1;
          `
        : '')}
  }
`;

export interface FlatSelectProps {
  className?: string;
  style?: React.CSSProperties;
  readonly?: boolean;
  multiple?: boolean;
  align?: 'column' | 'row';
  value: number[];
  onChange(indexes: number[]): void;
  children: React.ReactNode[];
}

export const FlatSelect = styled(
  ({
    value,
    onChange,
    children,
    multiple = true,
    align = 'row',
    readonly,
    ...p
  }: FlatSelectProps) => {
    const handleChange = useCallback(
      (index: number) => {
        if (readonly) {
          return;
        }
        const selected = value.includes(index);

        if (!multiple) {
          return onChange(selected ? [] : [index]);
        }

        return onChange(selected ? value.filter((v) => v !== index) : [...value, index]);
      },
      [multiple, onChange, value, readonly],
    );

    const Wrapper = align == 'row' ? Row : Column;

    return (
      <Container {...p} margin={16} as={Wrapper} $align={align} $readonly={!!readonly}>
        {children.map((c, i) => {
          const checked = value.includes(i);

          return (
            <ItemWrapper key={String(i)} onClick={() => handleChange(i)}>
              <Item $checked={checked}>
                {!readonly && <Checkbox onChange={() => {}} checked={checked} />}
                <Children>{c}</Children>
              </Item>
            </ItemWrapper>
          );
        })}
      </Container>
    );
  },
)``;
