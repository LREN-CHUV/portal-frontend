export const round = (value: number, decimals: number = 3) => Number(Math.round(parseFloat(value+'e'+decimals))+'e-'+decimals);
