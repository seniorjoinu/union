import React, { useEffect, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import { useCandidArgs, UseCandidArgsProps } from './hook';

export interface CandidPayloadProps extends UseCandidArgsProps {
  className?: string;
  style?: React.CSSProperties;
  value?: ArrayBuffer | null;
  onChange?(value: ArrayBuffer | null): void;
}

export const CandidPayload = React.forwardRef<HTMLDivElement, CandidPayloadProps>(
  ({ value, canisterId, methodName, onChange = () => {}, ...p }, ref) => {
    const { type, form, decode } = useCandidArgs({ canisterId, methodName, name: 'payload' });

    useEffect(() => {
      if (!type?.argTypes.length) {
        return onChange(new ArrayBuffer(0));
      }

      let buffer: ArrayBuffer | null = null;

      try {
        buffer = IDL.encode(type.argTypes, form.defaultValues.payload || []);
      } catch (e) {}

      onChange(value || buffer || null);
    }, [type]);

    const defaultValue = useMemo(() => decode(value, type?.argTypes), [value, decode, type]);

    if (!type?.argTypes.length) {
      return null;
    }

    return (
      <form.Form
        {...p}
        onChange={(value, valid) => {
          if (!valid) {
            onChange(null);
            return;
          }

          const buffer = IDL.encode(type.argTypes, value.payload);

          return onChange(buffer);
        }}
        defaultValue={{ payload: defaultValue || [] }}
      />
    );
  },
);
