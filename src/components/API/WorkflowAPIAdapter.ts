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

const algorithms = JSON.parse(
  localStorage.getItem('workflows_algorithms') || '[]'
);
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

    if (!json) {
      return { error: 'An unhandled error occured', data: undefined };
    }

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
    })),
    engine: Engine.Workflow
  }));

  // FIXME: oh my god, that escalated quickly
  localStorage.setItem('workflows_algorithms', JSON.stringify(algorithms));

  return algorithms;
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
      (a.parameters as AlgorithmParameter[]).map((p: any) => ({
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
        const contentId = content && content.length > 0 && content[0].id;

        console.log('error: fetchResultDetail', contentId);
        fetchResultDetailBody(historyId, contentId).then(result2 => {
          workflowResults[historyId] = result2;
          buildWorkflowAlgorithmResponse(historyId, experimentResponse);
        });
      });

      return experimentResponse;
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

export { buildWorkflowAlgorithmList, buildWorkflowAlgorithmResponse };
