import numbro from 'numbro';
import { createBrowserHistory } from 'history';
import { useEffect, useState } from 'react';
import { VariableEntity } from './API/Core';
import { ModelResponse } from './API/Model';
import { IExperiment } from './API/Experiment';

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

export const handleSelectExperimentToModel = (
  setModel: (model?: ModelResponse | undefined) => Promise<void>,
  experiment: IExperiment
): void => {
  const parameters = experiment.algorithm.parameters;
  const extract = (field: string): VariableEntity[] | undefined => {
    const p = parameters.find(p => p.name === field)?.value as string;
    const separator = /\*/.test(p) ? '*' : /\+/.test(p) ? '+' : ',';
    const parameter = p
      ? p.split(separator).map(m => ({ code: m, label: m }))
      : undefined;

    return parameter;
  };

  const newModel: ModelResponse = {
    query: {
      pathology: parameters.find(p => p.name === 'pathology')?.value as string,
      trainingDatasets: extract('dataset'),
      variables: extract('y'),
      coVariables: extract('x'),
      filters: parameters.find(p => p.name === 'filter')?.value as string
    }
  };

  setModel(newModel);
};
