import { Algorithm } from './Core'

const buildWorkflowAlgorithmList = (json: any): Algorithm[] => {

    console.log(json)

    const algorithms = json.map((j:any) => ({
        code: j.id,
        label: j.name,
        source: 'workflow',
        type: ['workflow'],
        validation: true
    }))

    return algorithms
}
export { buildWorkflowAlgorithmList };
