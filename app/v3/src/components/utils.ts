import numbro from 'numbro';

export const round = (num: number, decimals: number = 3): string =>
  !isNaN(num) ? numbro(num).format({ mantissa: decimals }) : '';
