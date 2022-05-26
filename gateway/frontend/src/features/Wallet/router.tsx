import React from 'react';
import styled from 'styled-components';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Provider } from './context';
import { Profile, ChangeProfile } from './Profile';
import { Groups, CreateGroupForm, UpdateGroupForm } from './Groups';
import { Permissions, CreatePermissionForm, UpdatePermissionForm } from './Permissions';
import { AccessConfigs, CreateAccessConfigForm, UpdateAccessConfigForm } from './AccessConfigs';
import {
  VotingConfigs,
  CreateVotingConfigForm,
  UpdateVotingConfigForm,
  CreateNestedVotingConfigForm,
  UpdateNestedVotingConfigForm,
} from './VotingConfigs';
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
          <Route path='/groups/create' element={<CreateGroupForm />} />
          <Route path='/groups/edit/:groupId' element={<UpdateGroupForm />} />

          <Route path='/permissions' element={<Permissions />} />
          <Route path='/permissions/:permissionId' element={<Permissions />} />
          <Route path='/permissions/create' element={<CreatePermissionForm />} />
          <Route path='/permissions/edit/:permissionId' element={<UpdatePermissionForm />} />

          <Route path='/access-configs' element={<AccessConfigs />} />
          <Route path='/access-configs/:accessConfigId' element={<AccessConfigs />} />
          <Route path='/access-configs/edit/:accessConfigId' element={<UpdateAccessConfigForm />} />
          <Route path='/access-configs/create' element={<CreateAccessConfigForm />} />

          <Route path='/voting-configs' element={<VotingConfigs />} />
          <Route path='/voting-configs/:votingConfigId' element={<VotingConfigs />} />
          <Route path='/voting-configs/edit/:votingConfigId' element={<UpdateVotingConfigForm />} />
          <Route path='/voting-configs/create' element={<CreateVotingConfigForm />} />
          <Route
            path='/voting-configs/create-nested/:votingConfigId'
            element={<CreateNestedVotingConfigForm />}
          />
          <Route
            path='/voting-configs/create-nested-nested/:nestedVotingConfigId'
            element={<CreateNestedVotingConfigForm />}
          />
          <Route
            path='/voting-configs/edit-nested/:votingConfigId'
            element={<UpdateNestedVotingConfigForm />}
          />

          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/change' element={<ChangeProfile />} />

          <Route path='/wallet' element={<Info />} />
          <Route path='/wallet/edit-info' element={<UpdateInfoForm />} />
          <Route path='/wallet/upgrade-version' element={<UpgradeForm />} />

          <Route path='/assets' element={<Assets />} />
          <Route path='/assets/create-batch' element={<BatchesUploader />} />
          <Route path='/assets/install-code' element={<AssetsCanisterUpdater />} />
          <Route path='/versions/create' element={<VersionForm />} />

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
