import { Permission } from 'union-ts';

export type ParsedTarget = {
  type: 'SelfEmptyProgram' | 'Endpoint';
  canisterId?: string;
  method?: string;
};

export type ParsedPermission = {
  name: string;
  description: string;
  targets: ParsedTarget[];
};

export const parsePermission = (permission: Permission): ParsedPermission => {
  const targets = permission.targets.map((target) => {
    if ('Endpoint' in target) {
      return {
        canisterId: target.Endpoint.canister_id.toString(),
        method: target.Endpoint.method_name,
        type: 'Endpoint' as ParsedTarget['type'],
      };
    }
    if ('SelfEmptyProgram' in target) {
      return {
        type: 'SelfEmptyProgram' as ParsedTarget['type'],
      };
    }
    return {
      type: 'SelfEmptyProgram' as ParsedTarget['type'],
    };
  });

  return {
    name: permission.name,
    description: permission.description,
    targets,
  };
};
