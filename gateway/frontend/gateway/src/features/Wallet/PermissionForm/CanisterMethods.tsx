import React, { useState } from 'react';
import styled from 'styled-components';
import { Text, Option, MultiSelectSkeleton as MS } from 'components';
import { FormTarget } from './types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface CanisterMethodsProps {
  disabled?: boolean;
  value: FormTarget[];
  onChange(value: FormTarget[]): void;
}

export const CanisterMethods = ({}: CanisterMethodsProps) => {
  const [methods, setMethods] = useState();

  return <Container />;
};
