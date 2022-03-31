import React from 'react';
import styled from 'styled-components';
import { Text } from '../Text';

const HelperText = styled(Text)`
  color: red;
`;
const Label = styled(Text)``;
const Input = styled.input`
  min-height: 32px;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 32px;

  ${Label} {
    margin-bottom: 4px;
  }

  ${HelperText} {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(100%);
  }
`;

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string | undefined | null;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, style, label, helperText, ...p }, ref) => (
    <Container className={className} style={style}>
      <Label variant='p1'>{label}</Label>
      <Input {...p} ref={ref} />
      {helperText && <HelperText variant='caption'>{helperText}</HelperText>}
    </Container>
  ),
);

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string | undefined | null;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, style, label, helperText, ...p }, ref) => (
    <Container className={className} style={style}>
      <Label variant='p1'>{label}</Label>
      <Input {...p} as='textarea' ref={ref} />
      {helperText && <HelperText variant='caption'>{helperText}</HelperText>}
    </Container>
  ),
);
