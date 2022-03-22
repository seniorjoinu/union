import React from 'react';
import styled from 'styled-components';

export const Option = styled.option``;

const Container = styled.select`
  height: 32px;
`;

export interface SelectProps extends React.ButtonHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((p, ref) => (
  <Container {...p} ref={ref} />
));
