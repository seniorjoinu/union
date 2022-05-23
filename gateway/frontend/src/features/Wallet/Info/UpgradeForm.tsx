import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, Button as B, Select as S, Option } from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { useDeployer } from 'services';
import { UpgradeWalletVersionRequest } from 'deployer-ts';
import { useNavigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { DeployerSubmitButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';

const Select = styled(S)``;
const Button = styled(B)``;

const Container = styled(PageWrapper)`
  align-items: flex-start;

  & > ${Select} {
    margin-bottom: 24px;
  }

  ${Button} {
    align-self: flex-start;
  }
`;

export interface UpgradeFormData {
  version: string;
}

export interface UpgradeFormProps {
  className?: string;
  style?: React.CSSProperties;
}

// TODO use IDLRenderer
export const UpgradeForm = (p: UpgradeFormProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<UpgradeFormData>({
    defaultValues: { version: '' },
    mode: 'onChange',
  });
  const nav = useNavigate();
  const { principal } = useCurrentUnion();
  const { canister, data } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    canister
      .get_binary_versions()
      .then(({ versions }) => canister.get_binary_version_infos({ versions }));
  }, []);

  const versions = useMemo(() => {
    const infos = data.get_binary_version_infos?.infos || [];

    return infos.filter((v) => 'Released' in v.status);
  }, [data.get_binary_version_infos?.infos]);

  useEffect(() => {
    const existing = getValues().version;

    if (existing || !versions.length) {
      return;
    }

    setValue('version', versions[0].version, { shouldValidate: true });
  }, [setValue, getValues, versions]);

  const getUpdatePayload = useCallback((): UpgradeWalletVersionRequest => {
    const { version } = getValues();

    return {
      new_version: version,
      canister_id: principal,
    };
  }, [getValues, principal]);

  return (
    <Container {...p} title='Upgrade wallet binary version' withBack>
      <Controller
        name='version'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <Select {...field} helperText={error?.message} title='Select version'>
            {versions.map(({ version }) => (
              <Option key={version} value={version}>
                {version}
              </Option>
            ))}
          </Select>
        )}
      />
      <DeployerSubmitButton
        unionId={principal}
        canisterId={Principal.from(process.env.UNION_DEPLOYER_CANISTER_ID)}
        methodName='upgrade_wallet_version'
        getPayload={() => [getUpdatePayload()]}
        onExecuted={() => nav(-1)}
        disabled={!isValid}
      >
        Upgrade version
      </DeployerSubmitButton>
    </Container>
  );
};
