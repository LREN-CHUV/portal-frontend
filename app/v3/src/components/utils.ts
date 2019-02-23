import numbro from 'numbro';

export const round = (num: number, decimals: number = 3) : string =>
  num ? numbro(num).format({ mantissa: decimals }) : '';
