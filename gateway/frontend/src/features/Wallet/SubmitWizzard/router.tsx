import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { ExternalForm, InternalForm } from '../../useClient';
import { SubmitWizzard } from './component';

export const SubmitWizzardRouter = ({ unionId }: { unionId: Principal }) => {
  const nav = useNavigate();

  return (
    <Routes>
      <Route
        path='/internal'
        element={
          <InternalForm required>
            {(data) => <SubmitWizzard unionId={unionId} data={data} onSuccess={() => nav(-1)} />}
          </InternalForm>
        }
      />
      <Route
        path='/external'
        element={
          <ExternalForm>
            {(data) => <SubmitWizzard unionId={unionId} data={data} onSuccess={() => nav(-1)} />}
          </ExternalForm>
        }
      />
      <Route path='' element={<Navigate to='internal' />} />
    </Routes>
  );
};
