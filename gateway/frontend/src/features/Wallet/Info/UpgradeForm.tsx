import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, Button as B, Select as S, Option } from 'components';
import { useForm, Controller } from 'react-hook-form';
import { useDeployer } from 'services';
import { UpgradeFormData, useUpgradeWallet } from './useUnionInfo';

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

export interface UpgradeFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpgradeForm = (p: UpgradeFormProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<UpgradeFormData>({
    defaultValues: { version: '' },
    mode: 'onTouched',
  });
  const { canister, data } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);
  const { upgradeWalletVersion } = useUpgradeWallet({ getValues });

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
      <Button type='submit' disabled={!isValid} onClick={() => upgradeWalletVersion()}>
        Save
      </Button>
    </Container>
  );
};
