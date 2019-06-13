import request from 'request-promise-native';

import { backendURL } from '../API';
import options from '../API/RequestHeaders';
import { Algorithm, AlgorithmParameter } from './Core';
import { hiddenParameters, stripModelParameters } from './ExaremeAPIAdapter';
import { ExperimentResponse } from './Experiment';
import { ModelResponse } from './Model';

interface Status {
  [key: string]: Response;
}

interface Response {
  error: string | undefined;
  data: any | undefined;
}

const algorithms = JSON.parse(localStorage.getItem('algorithms') || '{}');
const findParameter = (acode: string, pcode: string) => {
  const algorithm = algorithms && algorithms.find((a: any) => a.code === acode);

  if (algorithm) {
    const parameter = algorithm.parameters.find((p: any) => p.code === pcode);
    return parameter ? parameter.label : pcode;
  }
  return pcode;
};

const findName = (acode: string) => {
  const algorithm = algorithms && algorithms.find((a: any) => a.code === acode);

  return algorithm ? algorithm.label : acode;
};

const workflowStatuses: Status = {};
const workflowResults: Status = {};

const fetchStatus = async (historyId: string): Promise<Response> => {
  try {
    const data = await request.get(
      `${backendURL}/experiments/workflow/status/${historyId}`,
      options as RequestInit
    );
    const json = await JSON.parse(data);

    if (json.error) {
      return { error: json.error, data: undefined };
    }

    return { error: undefined, data: json };
  } catch (error) {
    console.log(error);
    return { error, data: undefined };
  }
};

const fetchResults = async (historyId: string): Promise<Response> => {
  try {
    const data = await request.get(
      `${backendURL}/experiments/workflow/results/${historyId}`,
      options as RequestInit
    );
    const json = await JSON.parse(data);

    if (json.error) {
      return { error: json.error, data: undefined };
    }

    return { error: undefined, data: json };
  } catch (error) {
    console.log(error);
    return { error, data: undefined };
  }
};

const fetchResultDetailBody = async (
  historyId: string,
  resultId: string
): Promise<Response> => {
  try {
    const data = await request.get(
      `${backendURL}/experiments/workflow/resultsbody/${historyId}/content/${resultId}`,
      options as RequestInit
    );
    const json = await JSON.parse(data);

    if (json.error) {
      return { error: json.error, data: undefined };
    }

    return { error: undefined, data: json };
  } catch (error) {
    console.log(error);
    return { error, data: undefined };
  }
};

const buildWorkflowAlgorithmList = (json: any): Algorithm[] => {
  const defaults = {
    kfold: 3,
    alpha: 0.1,
    testSize: 0.2
  };

  const constraints = {
    covariables: { min_count: 1 },
    groupings: { max_count: 0, min_count: 0 },
    mixed: true,
    variable: {
      binominal: true,
      integer: false,
      polynominal: true,
      real: false
    }
  };

  const defaultValueFor = ({
    label,
    defaults
  }: {
    label: string;
    defaults: any;
  }): string => {
    return defaults[label] ? defaults[label] : '';
  };

  const algorithms = json.map((j: any) => ({
    code: j.id,
    label: j.name,
    constraints,
    parameters: Object.keys(j.inputs).map((k: any) => ({
      code: j.inputs[k].uuid,

      default_value: defaultValueFor({ label: j.inputs[k].label, defaults }),
      description: '',
      label: j.inputs[k].label,
      type: 'text',
      value: defaultValueFor({ label: j.inputs[k].label, defaults }),
      visible: !hiddenParameters.includes(j.inputs[k].label)
    })),
    source: 'workflow',
    type: ['workflow'],
    validation: true
  }));

  return algorithms;
};

const buildWorkflowAlgorithmRequest = (
  model: ModelResponse,
  selectedMethod: Algorithm,
  newParams: AlgorithmParameter[]
) => {
  const params: any[] = [];

  if (model.query.variables) {
    const variableKey = selectedMethod.parameters.find(
      (p: any) => p.label === 'y'
    ).code;
    params.push({
      code: variableKey,
      value: model.query.variables.map(v => v.code).toString()
    });
  }

  if (model.query.coVariables) {
    const covariableKey = selectedMethod.parameters.find(
      (p: any) => p.label === 'x'
    ).code;
    params.push({
      code: covariableKey,
      value: model.query.coVariables.map(v => v.code).toString()
    });
  }

  if (model.query.trainingDatasets) {
    const datasetKey = selectedMethod.parameters.find(
      (p: any) => p.label === 'dataset'
    ).code;
    params.push({
      code: datasetKey,
      value: model.query.trainingDatasets.map(v => v.code).toString()
    });
  }

  // kfold
  const kfoldKey = selectedMethod.parameters.find(
    (p: any) => p.label === 'kfold'
  );
  if (kfoldKey) {
    const kFoldParam = newParams.find((p: any) => p.code === kfoldKey.code);
    params.push({
      code: kfoldKey.code,
      value: (kFoldParam && kFoldParam.value) || '3'
    });
  }

  // alpha
  const alphaKey = selectedMethod.parameters.find(
    (p: any) => p.label === 'alpha'
  );
  if (alphaKey) {
    const alphaParam = newParams.find((p: any) => p.code === alphaKey.code);
    params.push({
      code: alphaKey.code,
      value: (alphaParam && alphaParam.value) || '0.1'
    });
  }

  // others
  const leftOvers = selectedMethod.parameters.filter(
    (p: any) => !params.map((p: any) => p.code).includes(p.code)
  );
  if (leftOvers) {
    leftOvers.forEach((l: any) => {
      params.push({
        code: l.code,
        value: l.value
      });
    });
  }

  return params;
};

const buildWorkflowAlgorithmResponse = (
  historyId: string,
  experimentResponse: ExperimentResponse
) => {
  // Retrieve parameters names
  experimentResponse.algorithms = experimentResponse.algorithms.map(a => ({
    ...a,
    name: findName(a.code),
    parameters:
      a.parameters &&
      a.parameters.map((p: any) => ({
        ...p,
        code: findParameter(a.code, p.code)
      }))
  }));

  experimentResponse = stripModelParameters(experimentResponse);

  // console.log('buildWorkflowAlgorithmResponse', historyId)
  const workflowResult: Response = workflowResults[historyId];
  const workflowStatus: Response = workflowStatuses[historyId];

  if (workflowResult) {
    if (workflowResult.error) {
      return {
        ...experimentResponse,
        error: "Couldn't perform workflow. Please check the parameters"
      };
    }

    const results = workflowResult.data
      .filter((d: any) => d.result.length > 0)
      .map((d: any) => d.result[0])
      .map((d: any) => ({ data: [d.data], mime: d.type }));

    experimentResponse.results = [
      {
        algorithms: results.map((result: any, i: number) => ({
          algorithm: `Naive Bayes ${i}`,
          ...result
        })),
        name: 'local'
      }
    ];

    return experimentResponse;
  }

  if (!workflowStatus) {
    console.log('!workflowStatus fetchStatus', historyId);
    fetchStatus(historyId).then(result => {
      workflowStatuses[historyId] = result;
      buildWorkflowAlgorithmResponse(historyId, experimentResponse);
    });

    return experimentResponse;
  } else if (workflowStatus && workflowStatus.error) {
    return {
      ...experimentResponse,
      error: "Couldn't perform workflow. Please check the parameters"
    };
  }

  if (workflowStatus.data) {
    if (workflowStatus.data.state === 'error') {

      fetchResults(historyId).then(result => {
        const content = result.data.filter((d: any) => d.state === 'error');
        const contentId = content.pop().id;

        console.log('error: fetchResultDetail', historyId);
        fetchResultDetailBody(historyId, contentId).then(result2 => {
          workflowResults[historyId] = result2;
          buildWorkflowAlgorithmResponse(historyId, experimentResponse);
        });
      });
      
      return {
        ...experimentResponse,
        error: "Couldn't perform the workflow. Please check the parameters"
      };
    }

    if (workflowStatus.data.state === 'running') {
      console.log('running: fetchStatus', historyId);
      fetchStatus(historyId).then(result => {
        workflowStatuses[historyId] = result;
        // buildWorkflowAlgorithmResponse(historyId, experimentResponse);
      });

      return experimentResponse;
    }

    if (workflowStatus.data.state === 'ok') {
      console.log('ok', historyId);
      const workflowResult1: Response = workflowResults[historyId];
      if (!workflowResult1) {
        console.log('fetchResults', historyId);
        fetchResults(historyId).then(result => {
          const content = result.data.filter((d: any) => d.visible);
          const contentId = content.pop().id;

          console.log('fetchResultDetail', historyId);
          fetchResultDetailBody(historyId, contentId).then(result2 => {
            workflowResults[historyId] = result2;
            buildWorkflowAlgorithmResponse(historyId, experimentResponse);
          });
        });
      }

      return experimentResponse;
    }
  }

  return experimentResponse;
};

export {
  buildWorkflowAlgorithmList,
  buildWorkflowAlgorithmRequest,
  buildWorkflowAlgorithmResponse
};
