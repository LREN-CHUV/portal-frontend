import React, { useEffect, useRef, useState } from 'react';
import { FormControl } from 'react-bootstrap';

import { APICore } from '../API';
import { VariableEntity } from '../API/Core';

type LocalVar = VariableEntity[] | undefined;
interface Props {
  apiCore: APICore;
  categoricalVariables?: VariableEntity[];
}

export default ({ apiCore, categoricalVariables }: Props) => {
  const [categories, setCategories] = useState<LocalVar>();
  const [category, setCategory] = useState<VariableEntity | undefined>();
  const [value, setValue] = useState<string>();
  //   const categoryRef = useRef(null);
  //   const valueRef = useRef(null);

  useEffect(() => {
    const vars =
      categoricalVariables &&
      categoricalVariables
        .map(v => apiCore.lookup(v.code))
        .filter(v => v.type === 'polynominal' || v.type === 'binominal');

    setCategories(vars);
  }, []);

  const handleChangeCategory = (event: any) => {
    event.preventDefault();
    const theVar =
      categories && categories.find((v: any) => (v.code = event.target.value));
    setCategory(theVar);
  };

  const handleChangeValue = (event: any) => {
    event.preventDefault();
    setValue(event.target.value);
  };

  return (
    <>
      {categories && (
        <div>
          <FormControl
            componentClass='select'
            placeholder='select'
            // tslint:disable-next-line jsx-no-lambda
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
            // ref={valueRef}
            // tslint:disable-next-line jsx-no-lambda
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
