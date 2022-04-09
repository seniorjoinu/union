import { RoleType, Permission } from 'wallet-ts';

export type ParsedRoleType = {
  title: string;
  description: string;
  enumerated: number[];
  threshold: number;
  type: '' | 'Profile' | 'Everyone' | 'FractionOf' | 'QuantityOf';
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
      type: 'Profile',
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
      type: 'Everyone',
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

export type ParsedTarget = {
  type: 'Canister' | 'SelfEmptyProgram' | 'Endpoint';
  principal?: string;
  canisterId?: string;
  method?: string;
};

export type ParsedPermission = {
  name: string;
  scope: string;
  targets: ParsedTarget[];
};

export const parsePermission = (permission: Permission): ParsedPermission => {
  const targets = permission.targets.map((target) => {
    if ('Canister' in target) {
      return {
        principal: target.Canister.toString(),
        type: 'Canister' as ParsedTarget['type'],
      };
    }
    if ('SelfEmptyProgram' in target) {
      return {
        type: 'SelfEmptyProgram' as ParsedTarget['type'],
      };
    }

    return {
      type: 'Endpoint' as ParsedTarget['type'],
      canisterId: target.Endpoint.canister_id.toString(),
      method: target.Endpoint.method_name,
    };
  });

  return {
    name: permission.name,
    scope: Object.keys(permission.scope)[0] || '',
    targets,
  };
};
