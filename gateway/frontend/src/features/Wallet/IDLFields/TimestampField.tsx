import React, { useCallback, useMemo } from 'react';
import { TextField, TextFieldProps } from '@union/components';
import styled from 'styled-components';

export interface TimestampFieldProps extends Omit<Partial<TextFieldProps>, 'value' | 'onChange'> {
  value: bigint | null | void;
  onChange(v: bigint | null): void;
  multiplier?: number;
}

export const TimestampField = styled(
  ({ value, onChange, multiplier = 10 ** 6, ...p }: TimestampFieldProps) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const restricted = e.target.value.replace(/[dhms0-9 ]/g, '');

        if (restricted.length) {
          return onChange(null);
        }

        const parsed = parseTime(e.target.value);

        if (parsed.error) {
          return onChange(null);
        }

        const error = validate(parsed);

        if (error) {
          return onChange(null);
        }

        const timestamp = getTimestamp(parsed);

        onChange(BigInt(timestamp * multiplier));
      },
      [onChange, multiplier],
    );

    const computedValue = useMemo(() => computeTime(value, multiplier), [value, multiplier]);

    return (
      <TextField
        onChange={handleChange}
        defaultValue={computedValue}
        placeholder='0d 0h 0m 0s'
        {...p}
      />
    );
  },
)``;

export const parseTime = (str: string) => {
  const d = str.match(/\d+d/g);
  const h = str.match(/\d+h/g);
  const m = str.match(/\d+m/g);
  const s = str.match(/\d+s/g);

  const error =
    (d?.length || 0) > 1 || (h?.length || 0) > 1 || (m?.length || 0) > 1 || (s?.length || 0) > 1;

  const days = d ? parseInt(d[0].replace('d', '')) : 0;
  const hours = h ? parseInt(h[0].replace('h', '')) : 0;
  const minutes = m ? parseInt(m[0].replace('m', '')) : 0;
  const seconds = s ? parseInt(s[0].replace('s', '')) : 0;

  return { days, hours, minutes, seconds, error };
};

export const computeTime = (value: bigint | number | null | void, multiplier: number = 10 ** 6) => {
  if (typeof value == 'undefined' || value == null) {
    return '';
  }
  const timestamp = Math.ceil(Number(value) / multiplier);
  const date = new Date(timestamp);
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getUTCHours();

  const withoutDays = getTimestamp({ seconds, minutes, hours, days: 0 });
  const days = Math.floor((timestamp - withoutDays) / (24 * 60 * 60 * 1000));
  let res = '';

  res += days ? `${days}d ` : '';
  res += hours ? `${hours}h ` : '';
  res += minutes ? `${minutes}m ` : '';
  res += seconds ? `${seconds}s ` : '';
  return res;
};

const validate = (p: { days: number; hours: number; minutes: number; seconds: number }) => {
  if (p.hours > 24) {
    return 'Wrong hours';
  }
  if (p.minutes > 60) {
    return 'Wrong minutes';
  }
  if (p.seconds > 60) {
    return 'Wrong seconds';
  }
};

const getTimestamp = (p: { days: number; hours: number; minutes: number; seconds: number }) =>
  p.seconds * 1000 +
  p.minutes * 60 * 1000 +
  p.hours * 60 * 60 * 1000 +
  p.days * 24 * 60 * 60 * 1000;
