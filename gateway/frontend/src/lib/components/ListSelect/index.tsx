import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Select as S, Option } from '../Select';
import { Text } from '../Text';
import { Button } from '../Button';

const Select = styled(S)``;
const AddButton = styled(Button)``;
const RemoveButton = styled(Button)`
  border: none;
  color: red;
  padding: 0;
`;
const Label = styled(Text)``;

const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 32px;

  ${Select} {
    flex-grow: 1;
  }

  ${Label} {
    margin-bottom: 4px;
  }
  ${Items} {
    margin-top: 16px;
  }
`;

export interface ListSelectProps extends IClassName {
  label: string;
  onChange(e: { target: { value: string[] } }): void;
  value: string[];
  from: { id: string; content?: JSX.Element | string | null }[];
}

export const ListSelect = React.forwardRef<HTMLDivElement, ListSelectProps>(
  ({ label, onChange, value, from, ...p }, ref) => {
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const onAdd = useCallback(() => {
      const newValue = selectRef.current?.value;

      if (!newValue) {
        return;
      }

      onChange({ target: { value: [...value, newValue] } });
      selectRef.current!.value = '';
    }, [selectRef, onChange, value]);

    return (
      <Container {...p} ref={ref}>
        <Label variant='p1'>{label}</Label>
        <Controls>
          <Select ref={selectRef}>
            {from
              .filter((o) => !value.find((v) => v == o.id))
              .map((o) => (
                <Option key={o.id} value={o.id}>
                  {o.content || o.id}
                </Option>
              ))}
          </Select>
          <AddButton onClick={onAdd}>+</AddButton>
        </Controls>
        {!!value.length && (
          <Items>
            {value.map((v, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Item key={String(i)}>
                <Text>{from.find((o) => o.id == v)?.content || v}</Text>
                <RemoveButton
                  onClick={() => onChange({ target: { value: value.filter((val) => val !== v) } })}
                >
                  -
                </RemoveButton>
              </Item>
            ))}
          </Items>
        )}
      </Container>
    );
  },
);
