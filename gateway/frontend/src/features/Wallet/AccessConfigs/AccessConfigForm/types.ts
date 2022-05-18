import { Principal } from '@dfinity/principal';
import { Group, Permission, Profile, AlloweeConstraint } from 'union-ts';

export interface AlloweeConstraintForm {
  type: 'Group' | 'Profile' | 'Everyone';
  group?: Group;
  profile?: Profile;
  minShares?: bigint;
}
export interface AccessConfigFormData {
  name: string;
  description: string;
  permissions: Permission[];
  allowees: AlloweeConstraintForm[];
}

export const mapAllowees = (allowees: AlloweeConstraintForm[]): AlloweeConstraint[] =>
  allowees
    .map((a) => {
      switch (a.type) {
        case 'Everyone': {
          return { Everyone: null };
        }
        case 'Group': {
          if (!a.group) {
            return null;
          }
          return { Group: { id: a.group.id[0]!, min_shares: a.minShares || BigInt(0) } };
        }
        case 'Profile': {
          if (!a.profile) {
            return null;
          }
          return { Profile: Principal.from(a.profile.id) };
        }
      }
    })
    .filter((a): a is AlloweeConstraint => !!a);
