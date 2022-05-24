import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  AdvancedOption,
  AdvancedSelect,
  AdvancedSelectProps,
  Text,
  TextField as TF,
} from '@union/components';
import { Principal } from '@dfinity/principal';
import { useCandid } from '../useCandid';

const TextField = styled(TF)`
  width: 100%;
`;

export interface CanisterMethodsProps extends Omit<AdvancedSelectProps, 'value' | 'onChange'> {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  canisterId: Principal | null | void;
  value: string | null | void;
  onChange(value: string | null | void): void;
}

export const CanisterMethods = React.forwardRef<HTMLDivElement, CanisterMethodsProps>(
  ({ value, onChange, canisterId, ...p }, ref) => {
    const { methods } = useCandid({ canisterId });

    return (
      <AdvancedSelect
        onChange={onChange}
        value={value ? [value] : []}
        multiselect={false}
        ref={ref}
        element={
          <TextField noBorder value={value || ''} onChange={(e) => onChange(e.target.value)} />
        }
        {...p}
      >
        {!!canisterId &&
          methods.map((field) => <AdvancedOption key={field} value={field} obj={field} />)}
      </AdvancedSelect>
    );
  },
);
