import React, { useCallback, useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import { APICore } from '../API';
import { VariableEntity } from '../API/Core';
import { Query } from '../API/Model';


type LocalVar = VariableEntity[] | undefined;
interface Props {
  apiCore: APICore;
  query?: Query;
  code: string;
  handleChangeCategoryParameter: (code: string, value: string) => void
}

export default ({ apiCore, query, code, handleChangeCategoryParameter }: Props) => {
  const [categories, setCategories] = useState<LocalVar>();
  const [category, setCategory] = useState<VariableEntity | undefined>();

  const lookupCallback = useCallback(apiCore.lookup, [])
  useEffect(() => {
    const categoricalVariables: VariableEntity[] | undefined = query && [
      ...(query.groupings || []),
      ...(query.coVariables || []),
      ...(query.variables || [])
    ];

    const vars =
      categoricalVariables &&
      categoricalVariables
        .map(v => lookupCallback(v.code))
        .filter(v => v.type === 'polynominal' || v.type === 'binominal');

    setCategories(vars);
    const first = (vars && vars.length && vars[0]) || undefined;
    setCategory(first);
  }, [query, lookupCallback]);

  const handleChangeCategory = (event: any) => {
    event.preventDefault();
    const theVar =
      categories && categories.find((v: any) => (v.code = event.target.value));
    setCategory(theVar);
  };

  const handleChangeValue = (event: any) => {
    event.preventDefault();
    const json = JSON.stringify({name: category && category.code, val: event.target.value})
    handleChangeCategoryParameter(code, json)
  };

  return (
    <>
      {categories && (
        <div>
          <FormControl
            componentClass='select'
            placeholder='select'
            id='parameter-var-chooser'
            onChange={handleChangeCategory}>
            {/* ref={categoryRef} */}
            {categories.map(v => (
              <option key={v.code} value={v.code}>
                {v.label}
              </option>
            ))}
          </FormControl>
          <FormControl
            componentClass='select'
            placeholder='select'
            id='parameter-category-chooser'
            // ref={valueRef}
            onChange={handleChangeValue}>
            {category &&
              category.enumerations &&
              category.enumerations.map((v: any) => (
                <option key={v.code} value={v.code}>
                  {v.label}
                </option>
              ))}
          </FormControl>
        </div>
      )}
    </>
  );
};
