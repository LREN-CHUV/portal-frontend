import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { D3Model } from './Container';

interface Props {
  Terms: any;
  filters: any;
  handleChangeFilter: any;
}

interface State {
  loading: boolean;
  TermsChanged: boolean;
}

const Formula = styled.textarea`
  width: 100%;
  height: 64px;
`;

interface Term {
  factor: string;
  operator: string | null;
  value: string | null;
}

export default ({ parameters }: { parameters: D3Model }) => {
  const [leftTerms, setLeftTerms] = useState<Term[]>();
  const [rightTerms, setRightTerms] = useState<Term[]>();
  const [formula, setFormula] = useState('');

  const craftFormula = () => {
    const left = leftTerms
      ? leftTerms
          .map(t => `${t.factor}`)
          .toString()
          .replace(/,/g, ' + ')
      : '';
    const right = rightTerms
      ? rightTerms
          .map(t => `${t.factor}`)
          .toString()
          .replace(/,/g, ' + ')
      : '';

    setFormula(`${left} ~ ${right}`);
  };

  useEffect(() => {
    if (parameters) {
      const variables = parameters.variables;
      if (variables) {
        setLeftTerms(
          variables.map(c => ({
            factor: c.data.code,
            operator: null,
            value: null
          }))
        );
      }

      const covariables = parameters.covariables;
      if (covariables) {
        setRightTerms(
          covariables.map(c => ({
            factor: c.data.code,
            operator: null,
            value: null
          }))
        );
      }

      craftFormula();
    }
  }, [parameters]);

  const onFormulaChange = (event: any) => {
    const textFormula = event.target.value;
    setFormula(textFormula);

    const [leftStringTerms, rightStringTerms] = textFormula.split('~');
    console.log(leftStringTerms, rightStringTerms);

    const rightFactors = rightStringTerms.split('+');
    setRightTerms(
      rightFactors.map((r: string) => ({
        factor: r,
        operator: null,
        value: null
      }))
    );
  };

  return (
    <>
      <Formula id="query-string" value={formula} onChange={onFormulaChange} />
      <button onClick={craftFormula}>validate</button>
      <div id="query-builder" />
    </>
  );
};
