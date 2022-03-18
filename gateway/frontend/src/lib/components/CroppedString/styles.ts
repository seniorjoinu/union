import styled from 'styled-components';
import { Text } from '../Text';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  * {
    z-index: 100;
  }
`;

export const Id = styled(Text)<{ len: number }>`
  color: ${({ theme }) => theme.colors.primary.master.color};
  transition: color 200ms ease;
  cursor: pointer;
  min-width: ${({ len }) => len * 8.2 + 10}px;
  padding-top: 1px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.master.darker};
  }
`;
