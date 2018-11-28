export const round = (num: number, decimals: number = 3) : number =>
  Math.round(num * Math.pow(10, decimals) + Number.EPSILON) / Math.pow(10, decimals);
