import React, { useCallback, useEffect, useState } from 'react';
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
  // value: string | null;
}

interface Formula {
  leftTerm: Term[];
  rightTerm: Term[];
}

export default ({ parameters }: { parameters: D3Model }) => {
  const [formula, setFormula] = useState<Formula>({
    leftTerm: [],
    rightTerm: []
  });
  const [editedFormula, setEditedFormula] = useState('');

  useEffect(() => {
    if (parameters) {
      const variables = parameters.variables;
      const covariables = parameters.covariables;

      // addMissing, filter duplicates
      const leftTerm = [
        ...((variables &&
          variables.map(v =>
            formula.leftTerm.map(t => t.factor).includes(v.data.code)
              ? formula.leftTerm.find(t => t.factor === v.data.code)!
              : { factor: v.data.code, operator: '+' }
          )) ||
          [])
      ].filter(
        t => variables && variables.map(v => v.data.code).includes(t.factor)
      );

      const rightTerm = [
        ...((covariables &&
          covariables.map(v =>
            formula.rightTerm.map(t => t.factor).includes(v.data.code)
              ? formula.rightTerm.find(t => t.factor === v.data.code)!
              : { factor: v.data.code, operator: '+' }
          )) ||
          [])
      ].filter(
        t => covariables && covariables.map(v => v.data.code).includes(t.factor)
      );

      setFormula({
        leftTerm,
        rightTerm
      });
    }
  }, [parameters]);

  const handleValidate = () => {
    const variables =
      parameters.variables && parameters.variables.map(c => c.data.code);
    const covariables =
      parameters.covariables && parameters.covariables.map(c => c.data.code);
    const [leftStringTerms, rightStringTerms] = editedFormula.split('~');

    const lbits = [
      '+', // first term dummy operator
      ...leftStringTerms
        .split(' ')
        .map(c => c.trim())
        .filter(c => c !== '')
    ];

    const leftTerm: Term[] = lbits
      .reduce(
        (acc: Term[], cur, i) =>
          i % 2 === 0 ? [...acc, { operator: cur, factor: lbits[i + 1] }] : acc,
        []
      )
      .filter(c => variables && variables.includes(c.factor));

    const rbits = [
      '+', // first term dummy operator
      ...rightStringTerms
        .split(' ')
        .map(c => c.trim())
        .filter(c => c !== '')
    ];

    const rightTerm: Term[] = rbits
      .reduce(
        (acc: Term[], cur, i) =>
          i % 2 === 0 ? [...acc, { operator: cur, factor: rbits[i + 1] }] : acc,
        []
      )
      .filter(c => covariables && covariables.includes(c.factor));

    setEditedFormula('');
    setFormula({ leftTerm, rightTerm });
  };

  const formulaToString = (): string => {
    if (editedFormula !== '') {
      return editedFormula;
    }

    const leftTerm = formula.leftTerm
      .map((l, i) => (i === 0 ? l.factor : `${l.operator} ${l.factor}`))
      .join(' ');

    const rightTerm = formula.rightTerm
      .map((l, i) => (i === 0 ? l.factor : `${l.operator} ${l.factor}`))
      .join(' ');

    return `${leftTerm} ~ ${rightTerm}`;
  };

  const onFormulaChange = (event: any) => {
    const textFormula: string = event.target.value;
    console.log(textFormula);
    setEditedFormula(textFormula);
  };

  return (
    <>
      <Formula
        id="formula-element"
        value={formulaToString()}
        onChange={onFormulaChange}
      />
      <button
        disabled={editedFormula !== ''}
        onClick={(): void => {
          setEditedFormula('');
        }}
      >
        Reset
      </button>
      <button disabled={editedFormula === ''} onClick={handleValidate}>
        Validate
      </button>
    </>
  );
};
