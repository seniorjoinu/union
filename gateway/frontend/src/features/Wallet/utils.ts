import { RoleType } from 'wallet-ts';

export type ParsedRoleType = {
  title: string;
  description: string;
  enumerated: number[];
  threshold: number;
  type: '' | 'FractionOf' | 'QuantityOf';
  principal: string;
};

const defaultRole: ParsedRoleType = {
  title: 'Unknown',
  description: '',
  enumerated: [],
  threshold: 0,
  type: '',
  principal: '',
};

export const parseRole = (type: RoleType): ParsedRoleType => {
  if ('Profile' in type) {
    return {
      ...defaultRole,
      title: type.Profile.name,
      description: type.Profile.description,
      principal: type.Profile.principal_id.toString(),
    };
  }
  if ('FractionOf' in type) {
    return {
      ...defaultRole,
      title: type.FractionOf.name,
      description: type.FractionOf.description,
      enumerated: type.FractionOf.enumerated,
      threshold: type.FractionOf.fraction,
      type: 'FractionOf',
    };
  }
  if ('Everyone' in type) {
    return {
      ...defaultRole,
      title: 'Everyone',
    };
  }
  if ('QuantityOf' in type) {
    return {
      ...defaultRole,
      title: type.QuantityOf.name,
      description: type.QuantityOf.description,
      enumerated: type.QuantityOf.enumerated,
      threshold: type.QuantityOf.quantity,
      type: 'QuantityOf',
    };
  }

  return defaultRole;
};
