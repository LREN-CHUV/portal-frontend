import { Algorithm } from './Core';
import { hiddenParameters } from './ExaremeAPIAdapter';

const buildWorkflowAlgorithmList = (json: any): Algorithm[] => {
  const algorithms = json.map((j: any) => ({
    code: j.id,
    label: j.name,
    parameters: Object.keys(j.inputs).map((k: any) => ({
      code: j.inputs[k].uuid,
      constraints: [],
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

const buildWorkflowAlgorithmRequest = () => {
  const staticValues: any = {
    '6c623013-79ce-4523-aa89-b1000fcd219a': 'car_buying,car_maint,car_doors,car_persons,car_lug_boot,car_safety',
    '79b95116-c6c5-45c6-b9b3-9818e1315510': '3',
    'd0552f27-0c95-4df8-8e58-134b0693bd13': '0.1',
    'ef9615a6-849f-43e9-a030-f470de321b7c': 'car_class',
    'f871f859-dce5-4c03-b0fe-2b5400e88bc2': 'car'
  };

  const params = Object.keys(staticValues).map(k => ({ 
    code: k,
    value: staticValues[k]
  }))

  return params;
};

export { buildWorkflowAlgorithmList, buildWorkflowAlgorithmRequest };
