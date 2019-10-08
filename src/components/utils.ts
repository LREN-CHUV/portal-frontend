import numbro from 'numbro';
import { createBrowserHistory } from 'history';

export const round = (num: number, decimals = 3): string =>
  // !(num % 1 === 0) checks if number is an Integer
  !isNaN(num) && !(num % 1 === 0)
    ? numbro(num).format({ mantissa: decimals })
    : `${num}`;

export const history = createBrowserHistory();
