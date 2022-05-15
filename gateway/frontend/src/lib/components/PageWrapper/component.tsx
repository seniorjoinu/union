import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Text } from '../Text';
import { Button } from '../Button';

const Icon = (p: React.SVGAttributes<SVGElement>) => (
  <svg
    width='25'
    height='25'
    viewBox='0 0 128 128'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...p}
  >
    <path
      d='M21.5736 42.7868L0.360352 64L21.5736 85.2132L42.7868 64L21.5736 42.7868Z'
      fill='currentColor'
    />
    <path
      d='M42.7867 21.5736L21.5735 42.7868L42.7867 64L63.9999 42.7868L42.7867 21.5736Z'
      fill='currentColor'
    />
    <path
      d='M42.7867 64L21.5735 85.2132L42.7867 106.426L63.9999 85.2132L42.7867 64Z'
      fill='currentColor'
    />
    <path
      d='M64.0001 85.2132L42.7869 106.426L64.0001 127.64L85.2133 106.426L64.0001 85.2132Z'
      fill='currentColor'
    />
    <path
      d='M64.0001 0.36039L42.7869 21.5736L64.0001 42.7868L85.2133 21.5736L64.0001 0.36039Z'
      fill='currentColor'
    />
    <path
      d='M64.0001 42.7868L42.7869 64L64.0001 85.2132L85.2133 64L64.0001 42.7868Z'
      fill='currentColor'
    />
    <path
      d='M106.426 42.7868L85.2131 64L106.426 85.2132L127.64 64L106.426 42.7868Z'
      fill='currentColor'
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
    top: 12px;
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
