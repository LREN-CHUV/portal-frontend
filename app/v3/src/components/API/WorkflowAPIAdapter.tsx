import { Algorithm, AlgorithmConstraintParameter, AlgorithmParameter } from './Core';
import { hiddenParameters } from './ExaremeAPIAdapter';
import { ModelResponse } from './Model';

const buildWorkflowAlgorithmList = (json: any): Algorithm[] => {
  const algorithms = json.map((j: any) => ({
    code: j.id,
    label: j.name,
    parameters: Object.keys(j.inputs).map((k: any) => ({
      code: j.inputs[k].uuid,
      constraints: [],
        // j.inputs[k].label === 'y'
        //   ? {
        //       variable: {
        //         binominal: true,
        //         integer: false,
        //         min_count: 1,
        //         polynominal: true,
        //         real: false
        //       }
        //     }
        //   : [],
      default_value: j.inputs[k].value,
      description: '',
      label: j.inputs[k].label,
      type: 'text',
      value: '',
      visible: !hiddenParameters.includes(j.inputs[k].label)
    })),
    source: 'workflow',
    type: ['workflow'],
    validation: true
  }));

  return algorithms;
};

const buildWorkflowAlgorithmRequest = (model: ModelResponse,
  selectedMethod: Algorithm,
  newParams: AlgorithmParameter[]) => {
  const params: any[] = [];

  if (model.query.variables) {
    const variableKey = selectedMethod.parameters.find((p:any) => p.label === 'y').code;
    params.push({
      code: variableKey,
      value: model.query.variables.map(v => v.code).toString()
    })
  }

  if (model.query.coVariables) {
    const covariableKey = selectedMethod.parameters.find((p:any) => p.label === 'x').code;
    params.push({
      code: covariableKey,
      value: model.query.coVariables.map(v => v.code).toString()
    })
  }

  if (model.query.trainingDatasets) {
    const datasetKey = selectedMethod.parameters.find((p:any) => p.label === 'dataset').code;
    params.push({
      code: datasetKey,
      value: model.query.trainingDatasets.map(v => v.code).toString()
    })
  }

  // kfold
  const kfoldKey = selectedMethod.parameters.find((p:any) => p.label === 'kfold').code;
  const kFoldParam = newParams.find((p:any) => p.code === kfoldKey)
  params.push({
    code: kfoldKey,
    value: (kFoldParam && kFoldParam.value) || '3'
  })

  // alpha
  const alphaKey = selectedMethod.parameters.find((p:any) => p.label === 'alpha').code;
  const alphaParam = newParams.find((p:any) => p.code === alphaKey)
  params.push({
    code: alphaKey,
    value: (alphaParam && alphaParam.value) || '0.1'
  })

  return params;
};

export { buildWorkflowAlgorithmList, buildWorkflowAlgorithmRequest };
