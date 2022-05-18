import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Text } from '../Text';
import { Button } from '../Button';

const HelperText = styled(Text)`
  color: red;
`;
const AddButton = styled(Button)``;
const RemoveButton = styled(Button)``;
const Label = styled(Text)``;
const Input = styled.input`
  min-height: 32px;
`;

const Children = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  ${HelperText} {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(100%);
  }
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

  ${AddButton} {
    margin-top: 16px;
    align-self: flex-end;
  }
`;

export interface MultiSelectSkeletonProps extends IClassName {
  label: string;
  onChange(e: { target: { value: Record<string, string>[] } }): void;
  value: Record<string, string>[];
  children: (refs: React.MutableRefObject<HTMLInputElement[]>) => JSX.Element;
  renderElement(
    value: Record<string, string>,
  ): JSX.Element | string | number | null | void | React.ReactNode;
  helperText?: string | undefined | null;
}

export const MultiSelectSkeleton = React.forwardRef<HTMLDivElement, MultiSelectSkeletonProps>(
  ({ label, onChange, value, children, renderElement, helperText, ...p }, ref) => {
    const fieldRefs = useRef<HTMLInputElement[]>([]);

    const onAdd = useCallback(() => {
      const refs = fieldRefs.current;

      if (!refs) {
        return;
      }

      const newValue: Record<string, string> = refs.reduce(
        (acc, next) => ({ ...acc, [next.id]: next.value }),
        {},
      );

      onChange({ target: { value: [...value, newValue] } });

      refs.forEach((ref) => {
        // eslint-disable-next-line no-param-reassign
        ref.value = '';
      });
    }, [fieldRefs.current, onChange, value]);

    return (
      <Container {...p} ref={ref}>
        <Label variant='p1' weight='medium'>
          {label}
        </Label>
        <Children>
          {children(fieldRefs)}
          {helperText && <HelperText variant='caption'>{helperText}</HelperText>}
        </Children>
        <AddButton onClick={onAdd}>+</AddButton>
        {!!value.length && (
          <Items>
            {value.map((v, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Item key={String(i)}>
                <Text>{renderElement(v) || null}</Text>
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
