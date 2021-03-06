export const HAS_PROFILE_GROUP_ID = BigInt(0);
export const DEFAULT_GROUP_IDS = [HAS_PROFILE_GROUP_ID];

export const ALLOW_WRITE_PERMISSION_ID = BigInt(0);
export const ALLOW_READ_PERMISSION_ID = BigInt(1);
export const ALLOW_SEND_FEEDBACK_PERMISSION_ID = BigInt(2);
export const ALLOW_VOTE_PERMISSION_ID = BigInt(3);
export const DEFAULT_PERMISSION_IDS = [
  ALLOW_WRITE_PERMISSION_ID,
  ALLOW_READ_PERMISSION_ID,
  ALLOW_SEND_FEEDBACK_PERMISSION_ID,
  ALLOW_VOTE_PERMISSION_ID,
];

export const ALLOW_VOTE_ACCESS_CONFIG_ID = BigInt(0);
export const UNLIMITED_ACCESS_CONFIG_ID = BigInt(1);
export const READ_ONLY_ACCESS_CONFIG_ID = BigInt(2);
export const DEFAULT_ACCESS_CONFIG_IDS = [
  ALLOW_VOTE_ACCESS_CONFIG_ID,
  UNLIMITED_ACCESS_CONFIG_ID,
  READ_ONLY_ACCESS_CONFIG_ID,
];

export const EMERGENCY_VOTING_CONFIG_ID = BigInt(0);
export const FEEDBACK_VOTING_CONFIG_ID = BigInt(1);
export const DEFAULT_VOTING_CONFIG_IDS = [EMERGENCY_VOTING_CONFIG_ID, FEEDBACK_VOTING_CONFIG_ID];
