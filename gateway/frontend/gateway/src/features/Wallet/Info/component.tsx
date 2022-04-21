import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, Text, SubmitButton as SB, ImageFile as IF } from 'components';
import { useDeployer, useWallet } from 'services';
import { downloadFileContent } from 'toolkit';
import { NavLink } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { useCurrentWallet } from '../context';

const ImageFile = styled(IF)``;
const Field = styled(Text)``;
const Button = styled(SB)``;
const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;
const Container = styled(PageWrapper)`
  ${ImageFile} {
    height: 100px;
    width: 100px;
  }
  ${Button} {
    align-self: flex-start;
  }

  ${Field}, ${ImageFile} {
    margin-bottom: 8px;
  }
`;

export interface InfoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Info = ({ ...p }: InfoProps) => {
  const { principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);
  const deployer = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    canister.get_info();
    deployer.canister.get_instances({ ids: [Principal.fromText(principal)] });
  }, []);

  const downloadCandid = useCallback(async () => {
    const candid = await canister.export_candid();

    downloadFileContent(candid, 'can.did');
  }, [canister]);

  const info = data.get_info?.info || null;

  const logo = useMemo(() => {
    if (!info || !info.logo[0]) {
      return null;
    }
    const fileInfo = info.logo[0];

    return new Blob([new Uint8Array(fileInfo.content)], {
      type: fileInfo.mime_type,
    });
  }, [info]);

  return (
    <Container {...p} title='Wallet info'>
      <Controls>
        <Button forwardedAs={NavLink} to='edit-info'>
          Edit info
        </Button>
        <Button forwardedAs={NavLink} to='upgrade-version'>
          Upgrade version
        </Button>
        <Button onClick={downloadCandid}>Download can.did</Button>
      </Controls>
      {!!fetching.get_info && <Text>fetching...</Text>}
      {info && (
        <>
          {logo && <ImageFile src={logo} />}
          <Field>ID: {principal.toString()}</Field>
          <Field>Name: {info.name}</Field>
          <Field>Description: {info.description}</Field>
          <Field>Version: {deployer.data.get_instances?.instances[0].binary_version || '?'}</Field>
          <Field>Balance: ?</Field>
          <Field>Storage: ?</Field>
          {/* <Text>Description: {info.logo}</Text> */}
        </>
      )}
    </Container>
  );
};
