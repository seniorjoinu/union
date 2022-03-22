import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface PermissionFormProps {
  create?: boolean;
}

export const PermissionForm = ({ create }: PermissionFormProps) => {
  const { permissionId } = useParams();

  console.log('create', create, permissionId);
  return <Container>CreatePermission</Container>;
};
