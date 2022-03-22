import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Text } from '../Text';
import { Button } from '../Button';

const AddButton = styled(Button)``;
const RemoveButton = styled(Button)`
  border: none;
  color: red;
  padding: 0;
`;
const Label = styled(Text)``;
const Input = styled.input`
  min-height: 32px;
`;

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

  ${Input} {
    flex-grow: 1;
  }

  ${Label} {
    margin-bottom: 4px;
  }
  ${Items} {
    margin-top: 16px;
  }
`;

export interface MultiSelectProps extends IClassName {
  label: string;
  onChange(e: { target: { value: string[] } }): void;
  value: string[];
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ label, onChange, value, ...p }, ref) => {
    const textField = useRef<HTMLInputElement | null>();

    const onAdd = useCallback(() => {
      const newValue = textField.current?.value;

      if (!newValue) {
        return;
      }

      onChange({ target: { value: [...value, newValue] } });
      textField.current!.value = '';
    }, [textField, onChange, value]);

    return (
      <Container {...p} ref={ref}>
        <Label variant='p1'>{label}</Label>
        <Controls>
          <Input ref={textField} onKeyDown={(e) => e.keyCode == 13 && onAdd()} />
          <AddButton onClick={onAdd}>+</AddButton>
        </Controls>
        {!!value.length && (
          <Items>
            {value.map((v, i) => (
              <Item key={String(i)}>
                <Text>{v}</Text>
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
