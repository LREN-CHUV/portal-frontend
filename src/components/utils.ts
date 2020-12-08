import numbro from 'numbro';
import { createBrowserHistory } from 'history';
import React, { useEffect, useState } from 'react';

export const round = (num: number, decimals = 3): string =>
  // !(num % 1 === 0) checks if number is an Integer
  !isNaN(num) && !(num % 1 === 0)
    ? numbro(num).format({ mantissa: decimals })
    : `${num}`;

export const history = createBrowserHistory();

/**
 * useKeyPress
 * @param {string} key - the name of the key to respond to, compared against event.key
 * @param {function} action - the action to perform on key press
 */

export function useKeyPressed(
  keyLookup: (event: KeyboardEvent) => boolean
): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (ev: KeyboardEvent): void =>
      setKeyPressed(keyLookup(ev));
    const upHandler = (ev: KeyboardEvent): void => setKeyPressed(keyLookup(ev));

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return (): void => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [keyLookup]);

  return keyPressed;
}
