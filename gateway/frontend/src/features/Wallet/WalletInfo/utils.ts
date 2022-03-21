import { RoleType } from 'wallet-ts';

export type ParsedRoleType = {
  title: string;
  description: string;
};

export const parseRole = (type: RoleType): ParsedRoleType => {
  if ('Profile' in type) {
    return {
      title: type.Profile.name,
      description: type.Profile.description,
    };
  }
  if ('FractionOf' in type) {
    return {
      title: type.FractionOf.name,
      description: type.FractionOf.description,
    };
  }
  if ('Everyone' in type) {
    return {
      title: 'Everyone',
      description: '',
    };
  }
  if ('QuantityOf' in type) {
    return {
      title: type.QuantityOf.name,
      description: type.QuantityOf.description,
    };
  }

  return { title: 'Unknown', description: '' };
};
