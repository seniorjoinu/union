import React from 'react';
import styled from 'styled-components';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { Executor } from '../Executor';
import { Provider } from './context';
import { RolesAndPermissions, MyRolesAndPermissions } from './RolesAndPermissions';
import { RoleForm } from './RoleForm';
import { RoleDetails } from './RoleDetails';
import { PermissionDetails } from './PermissionDetails';
import { PermissionForm } from './PermissionForm';
import { Participants } from './Participants';
import { Invite } from './Invite';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Wallet = () => {
  const params = useParams();
  const principal = params.id;

  if (!principal) {
    return <Navigate to='/wallets' replace />;
  }

  return (
    <Provider principal={principal}>
      <Container>
        <Routes>
          <Route path='/role/create' element={<RoleForm create />} />
          <Route path='/role/edit/:roleId' element={<RoleForm />} />
          <Route path='/role/:roleId' element={<RoleDetails />} />

          <Route path='/permission/create' element={<PermissionForm create />} />
          <Route path='/permission/edit/:permissionId' element={<PermissionForm />} />
          <Route path='/permission/:permissionId' element={<PermissionDetails />} />

          <Route path='/my-rnp' element={<MyRolesAndPermissions />} />
          <Route path='/rnp' element={<RolesAndPermissions />} />
          <Route path='/invite' element={<Invite />} />
          <Route path='/participants' element={<Participants />} />
          <Route path='/execute' element={<Executor canisterId={principal} />} />
          <Route path='' element={<Navigate to='my-rnp' />} />
        </Routes>
      </Container>
    </Provider>
  );
};
