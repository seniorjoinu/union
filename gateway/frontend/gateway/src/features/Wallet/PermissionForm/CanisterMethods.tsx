import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { useCandid } from '../useCandid';
import { useCurrentWallet } from '../context';
import { FormTarget } from './types';

const Method = styled(Text)<{ $selected: boolean }>`
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? 'black' : 'grey')};

  &:hover {
    color: black;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Method}:not(:last-child) {
    margin-bottom: 4px;
  }
`;

export interface CanisterMethodsProps {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value: FormTarget[];
  onChange(value: FormTarget[]): void;
}

export const CanisterMethods = React.forwardRef<HTMLDivElement, CanisterMethodsProps>(
  ({ value, onChange, disabled, ...p }, ref) => {
    const { principal } = useCurrentWallet();
    const { did } = useCandid({ canisterId: principal });

    const processMethod = useCallback(
      (methodName: string) => {
        if (disabled) {
          return;
        }

        const existingIndex = value.findIndex(
          (v) => v.methodName == methodName && v.canisterId == principal,
        );

        if (existingIndex !== -1) {
          const newValue = [...value];

          newValue.splice(existingIndex, 1);
          onChange(newValue);
        } else {
          onChange([...value, { canisterId: principal, methodName }]);
        }
      },
      [principal, disabled, onChange, value],
    );

    return (
      <Container ref={ref} {...p}>
        {did.methods.map((methodName) => (
          <Method
            key={methodName}
            variant='p2'
            onClick={() => processMethod(methodName)}
            $selected={!!value.find((v) => v.methodName == methodName && v.canisterId == principal)}
          >
            {methodName}
          </Method>
        ))}
      </Container>
    );
  },
);
