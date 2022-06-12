import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { ExternalForm, InternalForm } from '../../useClient';
import { CreateExecutionForm } from './CreateExecutionForm';
import { ExecutionHistory } from './component';

export const ExecutionRouter = ({ unionId }: { unionId: Principal }) => {
  const nav = useNavigate();

  return (
    <Routes>
      <Route
        path='/execute'
        element={
          <InternalForm required>
            {(data) => (
              <CreateExecutionForm
                data={data}
                onSuccess={() => nav('../execution-history', { replace: true })}
              />
            )}
          </InternalForm>
        }
      />
      <Route
        path='/external-execute'
        element={
          <ExternalForm>
            {(data) => (
              <CreateExecutionForm
                data={data}
                onSuccess={() => nav('../votings', { replace: true })}
              />
            )}
          </ExternalForm>
        }
      />
      <Route path='/create' element={<CreateExecutionForm />} />
      <Route path=':executionId' element={<ExecutionHistory />} />
      <Route path='' element={<ExecutionHistory />} />
    </Routes>
  );
};
