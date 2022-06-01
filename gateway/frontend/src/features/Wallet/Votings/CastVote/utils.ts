import { GroupId, ThresholdValue } from 'union-ts';

export const getGroupsFromThresholds = (v: ThresholdValue): GroupId[] => {
  const target = 'QuantityOf' in v ? v.QuantityOf.target : v.FractionOf.target;

  if ('Group' in target) {
    return [target.Group];
  }

  return Array.from(new Set(target.Thresholds.map(getGroupsFromThresholds).flat()));
};
