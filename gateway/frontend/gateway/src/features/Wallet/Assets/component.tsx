import { Text } from 'components';
import React from 'react';
import styled from 'styled-components';
import { AssetsCanisterCreator as AC } from './AssetsCanisterCreator';
import { AssetsCanisterUpdater as AU } from './AssetsCanisterUpdater';

const AssetsCanisterCreator = styled(AC)``;
const AssetsCanisterUpdater = styled(AU)``;
const Title = styled(Text)``;
const SubTitle = styled(Text)``;
const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

  ${SubTitle} {
    margin-bottom: 32px;
  }
  ${AssetsCanisterCreator} {
    margin-bottom: 48px;
  }
`;

export interface AssetsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Assets = ({ ...p }: AssetsProps) => {
  console.log(p);
  return (
    <Container {...p}>
      <Title variant='h2'>Создание и обновление канистеров</Title>
      <AssetsCanisterCreator />
      <SubTitle variant='h4'>Загрузка wasm в созданный канистер</SubTitle>
      <AssetsCanisterUpdater />
    </Container>
  );
};
