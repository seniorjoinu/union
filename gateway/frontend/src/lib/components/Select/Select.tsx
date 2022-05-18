import React from 'react';
import styled from 'styled-components';
import { Text } from '../Text';

export const Option = styled.option``;
const HelperText = styled(Text)`
  color: red;
`;

const SelectContainer = styled.select`
  height: 32px;
`;
const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 32px;

  ${HelperText} {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(100%);
  }
`;

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  helperText?: string | undefined | null;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', style, helperText, ...p }, ref) => (
    <Container className={className} style={style}>
      <SelectContainer {...p} ref={ref} />
      {helperText && <HelperText variant='caption'>{helperText}</HelperText>}
    </Container>
  ),
);
