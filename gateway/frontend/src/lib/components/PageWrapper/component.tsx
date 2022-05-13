import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Text } from '../Text';
import { Button } from '../Button';

const BackButton = styled(Button)``;
const Title = styled(Text)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${BackButton} {
    margin-bottom: 8px;
    align-self: flex-start;
  }
  ${Title} {
    margin-bottom: 64px;
  }
`;

export interface PageWrapperProps {
  className?: string;
  style?: React.CSSProperties;
  title: React.ReactNode | false | null | undefined;
  withBack?: boolean;
  children?: any;
}

export const PageWrapper = ({ title, withBack, children, ...p }: PageWrapperProps) => {
  const nav = useNavigate();

  return (
    <Container {...p}>
      {withBack && <BackButton onClick={() => nav(-1)}>{'<'}</BackButton>}
      {!!title && <Title variant='h2'>{title}</Title>}
      {children}
    </Container>
  );
};
