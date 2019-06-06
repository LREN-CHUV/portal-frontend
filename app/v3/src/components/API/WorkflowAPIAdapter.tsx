import { Algorithm } from './Core';
import { hiddenParameters } from './ExaremeAPIAdapter';

const buildWorkflowAlgorithmList = (json: any): Algorithm[] => {
  const algorithms = json.map((j: any) => ({
    code: j.id,
    label: j.name,
    source: 'workflow',
    parameters: Object.keys(j.inputs).map((k: any) => ({
      code: j.inputs[k].uuid,
      constraints: [],
      default_value: j.inputs[k].value,
      value: '',
      description: '',
      label: j.inputs[k].label,
      type: '',
      visible: !hiddenParameters.includes(j.inputs[k].label)
    })),
    type: ['workflow'],
    validation: true
  }));

  return algorithms;
};

const buildWorkflowAlgorithmRequest = () => {};

export { buildWorkflowAlgorithmList, buildWorkflowAlgorithmRequest };
