import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageWrapper, Text, SubmitButton as B } from '@union/components';
import { initUnionController, useDeployer } from 'services';
import styled from 'styled-components';
import moment from 'moment';
import { downloadFile } from 'toolkit';
import { NavLink } from 'react-router-dom';

const DeleteButton = styled(B)``;
const AddButton = styled(B)``;
const Button = styled(B)``;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey};

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Container = styled(PageWrapper)`
  ${AddButton} {
    align-self: flex-start;
    margin-bottom: 16px;
  }

  ${Item}:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface VersionsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Versions = ({ ...p }: VersionsProps) => {
  const [versionControllerCanister, setVersionControllerCanister] = useState('');
  const { canister, data, fetching } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  const remove = (...args: any[]) => {
    throw new Error('Not implemented');
  };

  useEffect(() => {
    canister.get_binary_controller();
    canister
      .get_binary_versions()
      .then(({ versions }) => canister.get_binary_version_infos({ versions }));
  }, []);

  useEffect(() => {
    const binaryController = data.get_binary_controller?.controller.toString();

    if (!binaryController) {
      return;
    }

    const controller = initUnionController(binaryController);

    controller.canister.get_my_groups().then(({ groups }) => {
      if (!groups.length) {
        return;
      }
      setVersionControllerCanister(binaryController);
    });
  }, [data.get_binary_controller, versionControllerCanister]);

  const versions = useMemo(
    () =>
      (data.get_binary_version_infos?.infos || []).sort(
        (a, b) => Number(b.created_at) - Number(a.created_at),
      ),
    [data.get_binary_version_infos?.infos],
  );

  const handleDownload = useCallback(
    async (version: string) => {
      const { binary } = await canister.download_binary({ version });

      if (!binary[0]) {
        return;
      }

      const file = new File([new Uint8Array(binary[0])], `${version}.wasm`, {
        type: 'application/wasm',
      });

      downloadFile(file);
    },
    [canister],
  );

  const progress = !!fetching.get_binary_versions || !!fetching.get_binary_version_infos;

  return (
    <Container {...p} title='Union-wallet versions'>
      {/* {!!versionControllerCanister && (
        <AddButton
          forwardedAs={NavLink}
          to={`/wallet/${versionControllerCanister}/versions/create`}
        >
          Create version
        </AddButton>
      )} */}
      {progress && <Text>fetching</Text>}
      {!progress && !versions.length && <Text>Versions list is empty</Text>}
      {versions.map((v) => (
        <Item key={v.version}>
          <Text>Version: {v.version}</Text>
          <Text>Description: {v.description}</Text>
          <Text>Status: {Object.keys(v.status)[0]}</Text>
          <Text>
            Created at:{' '}
            {moment(Math.ceil(Number(v.created_at) / 10 ** 6)).format("DD MMM'YY HH:mm:SS")}
          </Text>
          <Text>
            Updated at:{' '}
            {moment(Math.ceil(Number(v.updated_at) / 10 ** 6)).format("DD MMM'YY HH:mm:SS")}
          </Text>
          <Controls>
            {!!v.binary[0] && <Button onClick={() => handleDownload(v.version)}>Download</Button>}
            {/* {!('Deleted' in v.status) && !!versionControllerCanister && (
              <DeleteButton
                onClick={() => remove({ walletId: versionControllerCanister, version: v.version })}
                color='red'
              >
                Delete
              </DeleteButton>
            )} */}
          </Controls>
        </Item>
      ))}
    </Container>
  );
};
