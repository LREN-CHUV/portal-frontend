import APICore from '../../Core';
import config from '../../RequestHeaders';
import { InstanceMode } from '../../../App/App';

describe('Integration Test Core API', () => {
  const apiCore = new APICore(config);

  it('get pathologies', async () => {
    await apiCore.fetchPathologies();
    const result = apiCore.state.pathologies;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
    expect(result).toHaveLength(2);
  });

  it('get variables', async () => {
    const pathologies = apiCore.state.pathologies;
    const pathology = (pathologies && pathologies.find((d, i) => i === 0)) || {
      code: 'dementia'
    };
    const result = apiCore.variablesForPathology(pathology.code);
    expect(result).toBeTruthy();
    expect(result).toHaveLength(171);
  });

  it('get datasets', async () => {
    const pathologies = apiCore.state.pathologies;
    const pathology = (pathologies && pathologies.find((d, i) => i === 0)) || {
      code: 'dementia'
    };
    const result = apiCore.datasetsForPathology(pathology.code);
    expect(result).toBeTruthy();
    expect(result).toHaveLength(4);
  });

  it('get algorithms', async () => {
    await apiCore.algorithms(InstanceMode.Local);
    const result = apiCore.state.algorithms;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
    const anova = result && result.find(a => a.name === 'ANOVA');
    expect(anova).toBeTruthy();
  });

  it('get hierarchy', async () => {
    const pathologies = apiCore.state.pathologies;
    const pathology = (pathologies && pathologies.find((d, i) => i === 0)) || {
      code: 'dementia'
    };
    const result = apiCore.hierarchyForPathology(pathology.code);
    expect(result.code).toBeTruthy();
  });
});
