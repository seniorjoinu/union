import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { CreateVotingForm, UpdateVotingForm } from './VotingForm';
import { MultipleChoicesForm, CreateChoiceForm, UpdateChoiceForm } from './ChoicesForm';
import { ExternalVotingForm } from './External';
import { InternalVotingForm } from './Internal';

export const VotingRouter = ({ unionId }: { unionId: Principal }) => {
  const nav = useNavigate();

  return (
    <Routes>
      <Route
        path='/execute'
        element={
          <InternalVotingForm
            required
            unionId={unionId}
            onSuccess={() => nav('../votings', { replace: true })}
          >
            {(props, data) => <CreateVotingForm {...props} unionId={unionId} data={data} />}
          </InternalVotingForm>
        }
      />
      <Route
        path='/external-execute'
        element={
          <ExternalVotingForm
            unionId={unionId}
            redirectToHistory={() => nav('../votings', { replace: true })}
          >
            {(props, data, onSuccess) => (
              <CreateVotingForm {...props} data={data} onSuccess={onSuccess} />
            )}
          </ExternalVotingForm>
        }
      />
      <Route
        path='/choices/:votingId'
        element={
          <InternalVotingForm required={false} unionId={unionId}>
            {(props, data) => {
              const { votingId } = useParams();

              return (
                <MultipleChoicesForm
                  unionId={unionId}
                  data={data}
                  onSuccess={() => nav(`../votings/voting/${votingId}`, { replace: true })}
                />
              );
            }}
          </InternalVotingForm>
        }
      />
      <Route
        path='/nested-choices/:votingId'
        element={
          <InternalVotingForm required={false} unionId={unionId}>
            {(props, data) => {
              const { votingId } = useParams();

              return (
                <MultipleChoicesForm
                  unionId={unionId}
                  data={data}
                  onSuccess={() => nav(`../votings/voting/${votingId}`, { replace: true })}
                />
              );
            }}
          </InternalVotingForm>
        }
      />
      <Route
        path='/choice/create/:votingId'
        element={<CreateChoiceForm unionId={unionId} onSuccess={() => nav(-1)} />}
      />
      <Route
        path='/choice/edit/:votingId/:choiceId'
        element={<UpdateChoiceForm unionId={unionId} onSuccess={() => nav(-1)} />}
      />
      <Route path='/create' element={<CreateVotingForm unionId={unionId} />} />
      <Route path='/edit/:votingId' element={<UpdateVotingForm unionId={unionId} />} />
      <Route path='' element={<Navigate to='/create' replace />} />
    </Routes>
  );
};
