import React from 'react';
import styled from 'styled-components';
import { Header as H } from '../features/Header';
import { SubHeader as SH } from '../features/SubHeader';

const Header = styled(H)``;
const SubHeader = styled(SH)``;

const Fixed = styled.section`
  display: flex;
  flex-direction: column;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Container = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  ${Fixed} {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
    background: white;
  }

  ${Header} {
  }

  ${SubHeader} {
    border-bottom: 1px solid grey;
  }

  ${Section} {
    display: flex;
    flex-direction: column;
    padding: 104px 128px 32px 128px;
    z-index: 1;

    & > * {
      height: 100%;
      min-width: 700px;
      align-self: center;
    }
  }
`;

export interface AppPageProps {
  children: any;
}

export const AppPage = ({ children }: AppPageProps) => (
  <Container>
    <Fixed>
      <Header />
      <SubHeader />
    </Fixed>
    <Section>{children}</Section>
  </Container>
);
