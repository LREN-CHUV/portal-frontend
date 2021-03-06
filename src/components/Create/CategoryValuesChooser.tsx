import React, { useCallback, useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import styled from 'styled-components';

import { APICore } from '../API';
import { Variable, VariableEntity } from '../API/Core';
import { Query } from '../API/Model';

type LocalVar = VariableEntity[] | undefined;
interface JsonParam {
  [name: string]: string | undefined;
}

interface Props {
  apiCore: APICore;
  parameterName: string;
  query?: Query;
  notblank?: boolean;
  handleChangeCategoryParameter: (code: string, value: string) => void;
}

const ControlBox = styled.div`
  padding-top: 16px;
`;

export default ({
  apiCore,
  query,
  parameterName,
  notblank = false,
  handleChangeCategoryParameter
}: Props): JSX.Element => {
  const [categories, setCategories] = useState<LocalVar>();
  const [referenceValues, setReferencesValues] = useState<JsonParam>();
  const lookupCallback = useCallback(apiCore.lookup, []);
  useEffect(() => {
    const categoricalVariables: VariableEntity[] | undefined = query && [
      ...(query.coVariables || []),
      ...(query.groupings || [])
    ];
    const vars =
      categoricalVariables &&
      categoricalVariables
        .map(v => lookupCallback(v.code))
        .filter(v => v.type === 'polynominal' || v.type === 'binominal');

    setCategories(vars);

    handleChangeCategoryParameter(parameterName, JSON.stringify([]));
  }, [query, lookupCallback]);

  const handleChangeValue = (
    event: React.FormEvent<FormControl>,
    name: string
  ): void => {
    event.preventDefault();

    const value = (event.target as HTMLInputElement).value;
    const params: JsonParam = {
      ...referenceValues,
      [name]: value !== 'select' ? value : undefined
    };
    setReferencesValues(params);

    const validKeys =
      params &&
      Object.keys(params).filter(k => {
        return params[k] !== undefined;
      });
    const jsonString = validKeys.map(k => ({ name: k, val: params[k] }));
    handleChangeCategoryParameter(parameterName, JSON.stringify(jsonString));
  };

  return (
    <>
      {!categories && <p>Please, select a categorical variable</p>}
      {categories &&
        categories.map(category => (
          <ControlBox key={category.code}>
            <p>
              <strong>{category.label}</strong>
            </p>
            <FormControl
              componentClass="select"
              placeholder="select"
              id="parameter-category-chooser"
              onChange={(event): void => {
                handleChangeValue(event, category.code);
              }}
            >
              <option value={'select'}>
                Select a level ({notblank ? 'mandatory' : 'optional'})
              </option>
              {category &&
                category.enumerations &&
                category.enumerations.map((v: Variable) => (
                  <option key={v.code} value={v.code}>
                    {v.label}
                  </option>
                ))}
            </FormControl>
          </ControlBox>
        ))}
    </>
  );
};
