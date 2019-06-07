import request from 'request-promise-native';
import { ExperimentResponse } from './Experiment';

import { Algorithm, AlgorithmParameter, workflowOptions } from './Core';
import { hiddenParameters } from './ExaremeAPIAdapter';
import { ModelResponse } from './Model';

interface Status {
  [key: string]: Response;
}

interface Response {
  error: string | undefined;
  data: any | undefined;
}

const workflowStatuses: Status = {};
const workflowResults: Status = {};

const fetchStatus = async (historyId: string): Promise<Response> => {
  try {
    const data = await request.get(
      `${process.env.REACT_APP_WORKFLOW_URL}/getWorkflowStatus/${historyId}`,
      workflowOptions
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
      `${process.env.REACT_APP_WORKFLOW_URL}/getWorkflowResults/${historyId}`,
      workflowOptions
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

const fetchResultDetail = async (
  historyId: string,
  resultId: string
): Promise<Response> => {
  try {
    const data = await request.get(
      `${
        process.env.REACT_APP_WORKFLOW_URL
      }/getWorkflowResultsBody/${historyId}/contents/${resultId}`,
      workflowOptions
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
  ).code;
  const kFoldParam = newParams.find((p: any) => p.code === kfoldKey);
  params.push({
    code: kfoldKey,
    value: (kFoldParam && kFoldParam.value) || '3'
  });

  // alpha
  const alphaKey = selectedMethod.parameters.find(
    (p: any) => p.label === 'alpha'
  ).code;
  const alphaParam = newParams.find((p: any) => p.code === alphaKey);
  params.push({
    code: alphaKey,
    value: (alphaParam && alphaParam.value) || '0.1'
  });

  return params;
};

const buildWorkflowAlgorithmResponse = (
  resultParsed: any,
  historyId: string,
  experimentResponse: ExperimentResponse
) => {
  const workflowResult: Response = workflowResults[historyId];
  const workflowStatus: Response = workflowStatuses[historyId];

  if (!workflowStatus) {
    fetchStatus(historyId).then(result => {
      workflowStatuses[historyId] = result;

      if (result.error) {
        return {
          ...experimentResponse,
          error: "Couldn't perform the workflow. Please check the parameters"
        };
      }
    });

    return experimentResponse;
  }

  if (workflowResult) {

    if (workflowResult.error) {
      return {
        ...experimentResponse,
        error: "Couldn't perform the workflow. Please check the parameters"
      };
    }
    const results = workflowResult.data
      .filter((d: any) => d.result.length > 0)
      .map((d: any) => d.result[0])
      .map((d: any) => ({ data: [d.data], mime: d.type }));

    const name =
      experimentResponse.algorithms.length > 0
        ? experimentResponse.algorithms[0].code
        : '';
    experimentResponse.results = [
      {
        algorithms: results.map((result: any) => ({
          algorithm: name,
          ...result
        })),
        name: 'local'
      }
    ];

    return experimentResponse;
  }

  if (workflowStatus.data) {
    if (workflowStatus.data.state === 'error') {
      return {
        ...experimentResponse,
        error: "Couldn't perform the workflow. Please check the parameters"
      };
    }

    if (workflowStatus.data.state === 'running') {
      fetchStatus(historyId).then(result => {
        workflowStatuses[historyId] = result;
      });

      return experimentResponse;
    }

    if (workflowStatus.data.state === 'ok') {
      const workflowResult1: Response = workflowResults[historyId];
      if (!workflowResult1) {
        fetchResults(historyId).then(result => {
          const content = result.data.filter((d: any) => d.visible);
          const contentId = content.pop().id;

          fetchResultDetail(historyId, contentId).then(result2 => {
            workflowResults[historyId] = result2;
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
