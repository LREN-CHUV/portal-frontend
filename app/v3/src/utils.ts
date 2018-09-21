export const round = (num: number, decimals: number = 3) =>
  Math.round(num * Math.pow(10, decimals) + Number.EPSILON) / Math.pow(10, decimals);
