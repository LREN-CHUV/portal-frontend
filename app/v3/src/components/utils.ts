import numeral from 'numeral';

export const round = (num: number, decimals: number = 3) =>  numeral(num).format(`0.${'0'.repeat(decimals)}`)
