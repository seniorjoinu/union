import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface CreateRoleProps {
  principal: string;
}

export const CreateRole = ({ principal }: CreateRoleProps) => {
  console.log('!!!', principal);

  return <Container>CreateRole</Container>;
};
