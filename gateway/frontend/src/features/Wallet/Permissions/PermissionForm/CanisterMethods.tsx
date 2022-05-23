import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Spinner as SP, Text } from '@union/components';
import { RemoteCallEndpoint } from 'union-ts';
import { useCandid } from '../../useCandid';
import { useCurrentUnion } from '../../context';

const Spinner = styled(SP)`
  align-self: center;
`;

const Method = styled(Text)<{ $selected: boolean }>`
  cursor: pointer;
  color: ${({ $selected, theme }) => ($selected ? theme.colors.dark : theme.colors.grey)};

  &:hover {
    color: ${({ theme }) => theme.colors.dark};
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
  value: RemoteCallEndpoint[];
  onChange(value: RemoteCallEndpoint[]): void;
}

export const CanisterMethods = React.forwardRef<HTMLDivElement, CanisterMethodsProps>(
  ({ value, onChange, disabled, ...p }, ref) => {
    const { principal } = useCurrentUnion();
    const { methods } = useCandid({ canisterId: principal });
    const principalStr = principal.toString();

    const processMethod = useCallback(
      (methodName: string) => {
        if (disabled) {
          return;
        }

        const existingIndex = value.findIndex(
          (v) => v.method_name == methodName && v.canister_id?.toString() == principalStr,
        );

        if (existingIndex !== -1) {
          const newValue = [...value];

          newValue.splice(existingIndex, 1);
          onChange(newValue);
        } else {
          onChange([...value, { canister_id: principal, method_name: methodName }]);
        }
      },
      [principal, disabled, onChange, value],
    );

    return (
      <Container ref={ref} {...p}>
        {!methods.length && <Spinner size={20} />}
        {methods.map((methodName) => (
          <Method
            key={methodName}
            variant='p2'
            onClick={() => processMethod(methodName)}
            $selected={
              !!value.find(
                (v) => v.method_name == methodName && v.canister_id?.toString() == principalStr,
              )
            }
          >
            {methodName}
          </Method>
        ))}
      </Container>
    );
  },
);
