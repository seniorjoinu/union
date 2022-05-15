import React from 'react';
import styled from 'styled-components';
import { useParams, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Provider } from './context';
import { Profile, ChangeProfile } from './Profile';
import { Groups, GroupForm } from './Groups';
import { Permissions } from './Permissions';
import { AccessConfigs } from './AccessConfigs';
import { Info, InfoForm, UpgradeForm } from './Info';
import { Assets, AssetsCanisterUpdater, BatchesUploader } from './Assets';
import { PermissionDetails } from './PermissionDetails';
import { VersionForm } from './VersionForm';
import { PermissionForm } from './PermissionForm';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Wallet = () => {
  const params = useParams();
  const nav = useNavigate();

  const principalStr = params.id || '';
  const principal = checkPrincipal(principalStr);

  if (!principal) {
    return <Navigate to='/wallets' replace />;
  }

  return (
    <Provider principal={principal}>
      <Container>
        <Routes>
          <Route path='/groups' element={<Groups />} />
          <Route path='/groups/:groupId' element={<Groups />} />
          <Route path='/groups/create' element={<GroupForm />} />

          <Route path='/permissions' element={<Permissions />} />

          <Route path='/access-configs' element={<AccessConfigs />} />

          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/change' element={<ChangeProfile />} />

          <Route path='/wallet' element={<Info />} />
          <Route path='/wallet/edit-info' element={<InfoForm />} />
          <Route path='/wallet/upgrade-version' element={<UpgradeForm />} />

          <Route path='/assets' element={<Assets />} />
          <Route path='/assets/create-batch' element={<BatchesUploader />} />
          <Route path='/assets/install-code' element={<AssetsCanisterUpdater />} />
          <Route path='/versions/create' element={<VersionForm />} />

          <Route path='/permission/create' element={<PermissionForm create />} />
          <Route path='/permission/edit/:permissionId' element={<PermissionForm />} />
          <Route
            path='/permission/:permissionId'
            element={
              <PermissionDetails edit={(permissionId) => nav(`permission/edit/${permissionId}`)} />
            }
          />

          {/* <Route path='/history' element={<History createLink='execute' />} />
          <Route
            path='/history/scheduled/:taskId'
            element={<ScheduledEntry navigateToEntry={(entryId) => nav(`history/${entryId}`)} />}
          />
          <Route path='/history/:entryId' element={<HistoryEntry />} /> */}
          {/* <Route
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
          /> */}
          <Route path='' element={<Navigate to='wallet' replace />} />
        </Routes>
      </Container>
    </Provider>
  );
};
