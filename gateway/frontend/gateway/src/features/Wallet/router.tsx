import React from 'react';
import styled from 'styled-components';
import { useParams, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ExternalExecutor, InternalExecutor, Executor } from '../Executor';
import { Provider } from './context';
import { Assets, AssetCanister } from './Assets';
import { RolesAndPermissions, MyRolesAndPermissions } from './RolesAndPermissions';
import { RoleForm } from './RoleForm';
import { RoleDetails } from './RoleDetails';
import { PermissionDetails } from './PermissionDetails';
import { VersionForm } from './VersionForm';
import { PermissionForm } from './PermissionForm';
import { Participants } from './Participants';
import { History, HistoryEntry, ScheduledEntry } from './History';
import { Invite } from './Invite';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Wallet = () => {
  const params = useParams();
  const nav = useNavigate();
  const principal = params.id;

  if (!principal) {
    return <Navigate to='/wallets' replace />;
  }

  return (
    <Provider principal={principal}>
      <Container>
        <Routes>
          <Route path='/assets' element={<Assets />} />
          <Route path='/assets/canister' element={<AssetCanister />} />
          <Route path='/versions/create' element={<VersionForm />} />

          <Route path='/role/create' element={<RoleForm create />} />
          <Route path='/role/edit/:roleId' element={<RoleForm />} />
          <Route
            path='/role/:roleId'
            element={<RoleDetails edit={(roleId) => nav(`role/edit/${roleId}`)} />}
          />

          <Route path='/permission/create' element={<PermissionForm create />} />
          <Route path='/permission/edit/:permissionId' element={<PermissionForm />} />
          <Route
            path='/permission/:permissionId'
            element={
              <PermissionDetails edit={(permissionId) => nav(`permission/edit/${permissionId}`)} />
            }
          />

          <Route
            path='/rnp'
            element={
              <RolesAndPermissions
                editRole={(roleId) => nav(`role/edit/${roleId}`)}
                editPermission={(permissionId) => nav(`permission/edit/${permissionId}`)}
                openRole={(roleId) => nav(`role/${roleId}`)}
                openPermission={(permissionId) => nav(`permission/${permissionId}`)}
              />
            }
          />
          <Route
            path='/rnp/my'
            element={
              <MyRolesAndPermissions
                editRole={(roleId) => nav(`role/edit/${roleId}`)}
                editPermission={(permissionId) => nav(`permission/edit/${permissionId}`)}
                openRole={(roleId) => nav(`role/${roleId}`)}
                openPermission={(permissionId) => nav(`permission/${permissionId}`)}
              />
            }
          />

          <Route path='/participants' element={<Participants />} />
          <Route path='/participants/invite' element={<Invite />} />

          <Route path='/history' element={<History createLink='execute' />} />
          <Route
            path='/history/scheduled/:taskId'
            element={<ScheduledEntry navigateToEntry={(entryId) => nav(`history/${entryId}`)} />}
          />
          <Route path='/history/:entryId' element={<HistoryEntry />} />
          <Route
            path='/history/execute'
            element={<Executor canisterId={principal} onSuccess={() => nav('history')} />}
          />
          <Route
            path='/execute'
            element={<InternalExecutor canisterId={principal} onSuccess={() => nav('history')} />}
          />
          <Route
            path='/external-execute'
            element={
              <ExternalExecutor canisterId={principal} redirectToHistory={() => nav('history')} />
            }
          />
          <Route path='' element={<Navigate to='history' replace />} />
        </Routes>
      </Container>
    </Provider>
  );
};
