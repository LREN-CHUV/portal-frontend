import request from 'request-promise-native';

import { backendURL } from '../API';
import { Algorithm, AlgorithmParameter } from '../API/Core';
import options from '../API/RequestHeaders';
import { UI_HIDDEN_PARAMETERS } from '../constants';
import { Engine, ExperimentResponse } from './Experiment';

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
      `${backendURL}/experiments/workflow/status/${historyId}`,
      options as RequestInit
    );
    const json = await JSON.parse(data);

    if (json.error) {
      return { error: json.error, data: undefined };
    }

    return { error: undefined, data: json };
  } catch (error) {
    // console.log(error);
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
    // console.log(error);
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

    if (!json) {
      return { error: 'An unhandled error occured', data: undefined };
    }

    if (json.error) {
      return { error: json.error, data: undefined };
    }

    return { error: undefined, data: json };
  } catch (error) {
    // console.log(error);
    return { error, data: undefined };
  }
};

// Used to fetch errors :-o
const fetchResultsDetails = async (
  historyId: string,
  okId: string
): Promise<Response> => {
  try {
    const data = await request.get(
      `${backendURL}/experiments/workflow/resultsdetails/${historyId}/content/${okId}`,
      options as RequestInit
    );
    const json = await JSON.parse(data);

    if (!json) {
      return { error: 'An unhandled error occured', data: undefined };
    }

    const errorString = json.peek;
    if (errorString) {
      const results1 = JSON.parse(errorString);
      const results = results1.result;
      const result = results.find((_: any, i: number) => i === 0);

      return { error: result.data, data: undefined };
    }

    return { error: undefined, data: json };
  } catch (error) {
    // console.log(error);
    return { error, data: undefined };
  }
};

const buildWorkflowAlgorithmList = (json: any): Algorithm[] => {
  const defaults = {
    alpha: 0.1,
    kfold: 3,
    testSize: 0.2
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

  const algorithms: Algorithm[] = json.map((j: any) => ({
    code: j.id,
    engine: Engine.Workflow,
    name: j.name,
    parameters: Object.keys(j.inputs).map((k: any) => ({
      uuid: j.inputs[k].uuid,

      /* eslint-disable-next-line */
      default_value: defaultValueFor({
        label: j.inputs[k].label,
        defaults
      }),
      description: '',
      name: j.inputs[k].label,
      type: 'text',
      defaultValue: defaultValueFor({
        label: j.inputs[k].label,
        defaults
      }),
      visible: !UI_HIDDEN_PARAMETERS.includes(j.inputs[k].label)
    }))
  }));

  // FIXME: oh my god, that escalated quickly
  localStorage.setItem('workflows_algorithms', JSON.stringify(algorithms));

  return algorithms;
};

const buildWorkflowAlgorithmResponse = (
  historyId: string,
  experimentResponse: ExperimentResponse
): ExperimentResponse => {
  const algorithms: Algorithm[] = JSON.parse(
    localStorage.getItem('workflows_algorithms') || '[]'
  );

  const findName = (algorithmCode: string): string => {
    const algorithm =
      algorithms && algorithms.find(a => a.code === algorithmCode);

    return algorithm ? algorithm.name : algorithmCode;
  };

  const findParameter = (
    algorithmCode: string,
    parameterCode: string
  ): string => {
    const algorithm =
      algorithms && algorithms.find(a => a.code === algorithmCode);

    if (algorithm) {
      const parameter = (algorithm.parameters as AlgorithmParameter[]).find(
        p => p.uuid === parameterCode
      );

      return parameter ? parameter.name : parameterCode;
    }

    return parameterCode;
  };

  // Retrieve parameters names
  experimentResponse.algorithms = experimentResponse.algorithms.map(a => ({
    ...a,
    name: findName(a.code),
    parameters:
      a.parameters &&
      (a.parameters as any).map((p: any) => ({
        ...p,
        code: findParameter(a.code, p.code)
      }))
  }));

  // experimentResponse = stripModelParameters(experimentResponse);
  experimentResponse.engine = Engine.Exareme;

  const workflowResult: Response = workflowResults[historyId];
  const workflowStatus: Response = workflowStatuses[historyId];

  if (workflowResult) {
    if (workflowResult.error) {
      return {
        ...experimentResponse,
        error: workflowResult.error
      };
    }

    const results = workflowResult.data
      .filter((d: any) => d.result.length > 0)
      .map((d: any) => d.result[0]);

    experimentResponse.results = results;

    return experimentResponse;
  }

  if (!workflowStatus) {
    // console.log('!workflowStatus fetchStatus', historyId);
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
      const okId =
        (workflowStatus.data.state_ids.ok &&
          workflowStatus.data.state_ids.ok.length > 0 &&
          workflowStatus.data.state_ids.ok[0]) ||
        null;
      if (okId) {
        fetchResultsDetails(historyId, okId).then(result => {
          workflowResults[historyId] = result;
          buildWorkflowAlgorithmResponse(historyId, experimentResponse);
        });
      }

      return experimentResponse;
    }

    if (workflowStatus.data.state === 'running') {
      // console.log('running: fetchStatus', historyId);
      fetchStatus(historyId).then(result => {
        workflowStatuses[historyId] = result;
      });

      return experimentResponse;
    }

    if (workflowStatus.data.state === 'ok') {
      // console.log('ok', historyId);
      const workflowResult1: Response = workflowResults[historyId];
      if (!workflowResult1) {
        // console.log('fetchResults', historyId);
        fetchResults(historyId).then(result => {
          const content = result.data.filter((d: any) => d.visible);
          const contentId = content.pop().id;

          // console.log('fetchResultDetail', historyId);
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

export { buildWorkflowAlgorithmList, buildWorkflowAlgorithmResponse };
