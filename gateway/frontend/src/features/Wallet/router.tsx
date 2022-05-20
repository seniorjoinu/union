import React from 'react';
import styled from 'styled-components';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Provider } from './context';
import { Profile, ChangeProfile } from './Profile';
import { Groups, GroupForm } from './Groups';
import { Permissions, PermissionForm } from './Permissions';
import { AccessConfigs, AccessConfigForm } from './AccessConfigs';
import { VotingConfigs, VotingConfigForm } from './VotingConfigs';
import { Info, UpdateInfoForm, UpgradeForm } from './Info';
import { Assets, AssetsCanisterUpdater, BatchesUploader } from './Assets';
import { VersionForm } from './VersionForm';
import { Test } from './Test';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Wallet = () => {
  const params = useParams();

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
          <Route path='/groups/create' element={<GroupForm create />} />
          <Route path='/groups/edit/:groupId' element={<GroupForm create={false} />} />

          <Route path='/permissions' element={<Permissions />} />
          <Route path='/permissions/:permissionId' element={<Permissions />} />
          <Route path='/permissions/create' element={<PermissionForm create />} />
          <Route
            path='/permissions/edit/:permissionId'
            element={<PermissionForm create={false} />}
          />

          <Route path='/access-configs' element={<AccessConfigs />} />
          <Route path='/access-configs/:accessConfigId' element={<AccessConfigs />} />
          <Route
            path='/access-configs/edit/:accessConfigId'
            element={<AccessConfigForm create={false} />}
          />
          <Route path='/access-configs/create' element={<AccessConfigForm create />} />

          <Route path='/voting-configs' element={<VotingConfigs />} />
          <Route path='/voting-configs/:votingConfigId' element={<VotingConfigs />} />
          <Route
            path='/voting-configs/edit/:votingConfigId'
            element={<VotingConfigForm create={false} />}
          />
          <Route path='/voting-configs/create' element={<VotingConfigForm create />} />

          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/change' element={<ChangeProfile />} />

          <Route path='/wallet' element={<Info />} />
          <Route path='/wallet/edit-info' element={<UpdateInfoForm />} />
          <Route path='/wallet/upgrade-version' element={<UpgradeForm />} />

          <Route path='/assets' element={<Assets />} />
          <Route path='/assets/create-batch' element={<BatchesUploader />} />
          <Route path='/assets/install-code' element={<AssetsCanisterUpdater />} />
          <Route path='/versions/create' element={<VersionForm />} />

          <Route path='/permission/create' element={<PermissionForm create />} />
          <Route path='/permission/edit/:permissionId' element={<PermissionForm />} />

          <Route path='/test' element={<Test />} />

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
