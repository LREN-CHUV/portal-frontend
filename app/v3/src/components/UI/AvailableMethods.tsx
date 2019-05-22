import * as React from 'react';
import { Button } from 'react-bootstrap';

import { Method, Methods, VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';

const AvailableMethods = ({
  methods,
  exaremeAlgorithms,
  variables,
  handleSelectMethod,
  model
}: {
  methods: Methods | undefined;
  exaremeAlgorithms: any[];
  variables: VariableEntity[] | undefined;
  handleSelectMethod: (method: Method) => void;
  model: ModelResponse | undefined;
}) => {
  const query = model && model.query;
  const modelVariable = query && query.variables && query.variables.map(v => v.code)[0];
  const modelCovariables = (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
  const modelGroupings = (query && query.groupings && query.groupings.map(v => v.code)) || [];

  const mergedAlgorithms = [...(methods && methods.algorithms || []) , ...(exaremeAlgorithms || [])];

  const availableAlgorithms =
    (variables &&
      query &&
      modelVariable &&
      mergedAlgorithms &&
      mergedAlgorithms.map(algorithm => {
        let isEnabled = false;
        const disabled = { ...algorithm, enabled: false };
        const enabled = { ...algorithm, enabled: true };

        const apiVariable = variables.find((v: any) => v.code === modelVariable);
        const algoConstraints: any = algorithm.constraints;
        const algoConstraintVariable = algoConstraints.variable;
        const apiVariableType = apiVariable && apiVariable.type;

        if (apiVariableType) {
          if (algoConstraintVariable[apiVariableType]) {
            isEnabled = true;
          }
        }

        const algoConstraintCovariable = algoConstraints.covariables;
        if (modelCovariables.length < algoConstraintCovariable && algoConstraintCovariable.min_count) {
          isEnabled = false;
        }

        if (modelCovariables.length < algoConstraintCovariable && algoConstraintCovariable.max_count) {
          isEnabled = false;
        }

        const algoConstraintGrouping = algoConstraints.groupings;
        if (modelGroupings.length < algoConstraintGrouping && algoConstraintGrouping.min_count) {
          isEnabled = false;
        }

        if (modelGroupings.length < algoConstraintGrouping && algoConstraintGrouping.max_count) {
          isEnabled = false;
        }

        const mixed = algoConstraints.mixed;
        if (modelGroupings.length > 0 && modelCovariables.length > 0 && !mixed) {
          isEnabled = false;
        }

        return isEnabled ? enabled : disabled;
      })) ||
    [];

  const sortedAlgorithms =
  availableAlgorithms &&
  availableAlgorithms.sort((a: Method, b: Method) => {
      try {
        const typea = (a && a.type && a.type.length > 0 && a.type[0]) || '';
        const typeb = (b && b.type && b.type.length > 0 && b.type[0]) || '';

        return typea < typeb ? 1 : typea > typeb ? -1 : 0;
      } catch (e) {
        return 0;
      }
    });

  const filteredAlgorithms =
    sortedAlgorithms &&
    sortedAlgorithms.filter(
      a =>
        a.code !== 'histograms' &&
        a.code !== 'WP_VARIABLES_HISTOGRAM' &&
        a.code !== 'statisticsSummary' &&
        a.code !== 'hinmine' &&
        a.code !== 'hedwig' &&
        a.code !== 'ggparci' &&
        a.code !== 'kmeans' &&
        a.code !== 'heatmaply'
    );

  const types = Array.from(new Set(filteredAlgorithms.map(f => f.type).flat(1)));

  // console.log(filteredAlgorithms.map((f, i) => `${i + 1}.${f.code}`).join('\n'))
  return (
    <React.Fragment>
      {types.map(type => (
        <div className='method' key={type}>
          <h4>{type}</h4>
          {filteredAlgorithms
            .filter(a => a.type && a.type.includes(type))
            .map((algorithm: any) => (
              <div className='method' key={algorithm.code}>
                <Button
                  key={algorithm.code}
                  bsStyle='link'
                  title={`${algorithm.type} - ${algorithm.description}`}
                  // tslint:disable-next-line jsx-no-lambda
                  onClick={() => handleSelectMethod(algorithm)}
                  style={{
                    color: algorithm.enabled ? '#03a9f4' : 'gray',
                    padding: 0,
                    textTransform: 'none'
                  }}
                  disabled={!algorithm.enabled}>
                  {algorithm.label}
                </Button>
              </div>
            ))}
        </div>
      ))}
    </React.Fragment>
  );
};
export default AvailableMethods;
