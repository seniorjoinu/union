import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Text } from '../Text';

const Icon = (p: React.SVGAttributes<SVGElement>) => (
  <svg
    width='16'
    height='32'
    viewBox='0 0 16 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...p}
  >
    <path
      d='M1.35446 16.6708L13.7313 30.7514C14.0227 31.0829 14.49 31.0829 14.7814 30.7514C15.0729 30.4198 15.0729 29.8881 14.7814 29.5566L2.93249 16.0765L14.7814 2.59643C15.0729 2.2649 15.0729 1.73321 14.7814 1.40168C14.6385 1.23904 14.446 1.15147 14.2591 1.15147C14.0722 1.15147 13.8797 1.23279 13.7368 1.40168L1.35996 15.4823C1.06855 15.8075 1.06855 16.3455 1.35446 16.6708Z'
      fill='currentColor'
      stroke='currentColor'
    />
  </svg>
);

const BackButton = styled(Icon)`
  color: ${({ theme }) => theme.colors.dark};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.grey};
  }
`;
const Title = styled(Text)``;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;

  ${BackButton} {
    position: absolute;
    top: 8px;
    left: -24px;
    transform: translateX(-100%);
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
      {withBack && <BackButton onClick={() => nav(-1)} />}
      {!!title && <Title variant='h2'>{title}</Title>}
      {children}
    </Container>
  );
};
