import request from 'request-promise-native';
import { ExperimentResponse } from './Experiment';
import { stripModelParameters} from './ExaremeAPIAdapter';
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

const algorithms = JSON.parse(localStorage.getItem('algorithms') || "{}");
const findParameter = (acode: string, pcode: string) => {
  const algorithm = algorithms && algorithms.find((a:any) => a.code === acode);

  if (algorithm) {
    const parameter = algorithm.parameters.find((p:any) => p.code === pcode)
    return parameter ? parameter.label : pcode;
  }
  return pcode;
}

const findName = (acode: string) => {
  const algorithm = algorithms && algorithms.find((a:any) => a.code === acode);

  return algorithm ? algorithm.label: acode
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
  const leftOvers = selectedMethod.parameters.filter((p: any) => !params.map((p: any) => p.code).includes(p.code))
  if (leftOvers) {
    leftOvers.forEach((l:any) => {
      params.push({
        code: l.code,
        value: l.value
      })
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
    parameters: a.parameters && a.parameters.map((p:any) => ({
      ...p,
      code: findParameter(a.code, p.code)
    }))
  }))

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
          fetchResultDetail(historyId, contentId).then(result2 => {
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
