import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { ExternalForm, InternalForm } from '../../../useClient';
import { CreateVotingForm, UpdateVotingForm } from './VotingForm';
import { MultipleChoicesForm, CreateChoiceForm, UpdateChoiceForm } from './ChoicesForm';

export const VotingRouter = ({ unionId }: { unionId: Principal }) => {
  const nav = useNavigate();

  return (
    <Routes>
      <Route
        path='/execute'
        element={
          <InternalForm required>
            {(data) => (
              <CreateVotingForm
                unionId={unionId}
                onSuccess={() => nav('../votings', { replace: true })}
                data={data}
              />
            )}
          </InternalForm>
        }
      />
      <Route
        path='/external-execute'
        element={
          <ExternalForm redirectToHistory={() => nav('../votings', { replace: true })}>
            {(data, onSuccess) => (
              <CreateVotingForm unionId={unionId} data={data} onSuccess={onSuccess} />
            )}
          </ExternalForm>
        }
      />
      <Route
        path='/choices/:votingId'
        element={
          <InternalForm required={false}>
            {(data) => {
              const { votingId } = useParams();

              return (
                <MultipleChoicesForm
                  unionId={unionId}
                  data={data}
                  onSuccess={() => nav(`../votings/voting/${votingId}`, { replace: true })}
                />
              );
            }}
          </InternalForm>
        }
      />
      {/* <Route
        path='/nested-choices/:votingId'
        element={
          <InternalForm required={false}>
            {(data) => {
              const { votingId } = useParams();

              return (
                <MultipleChoicesForm
                  unionId={unionId}
                  data={data}
                  onSuccess={() => nav(`../votings/voting/${votingId}`, { replace: true })}
                />
              );
            }}
          </InternalForm>
        }
      /> */}
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
