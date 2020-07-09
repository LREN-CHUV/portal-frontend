import APICore from '../../Core';
import config from '../../RequestHeaders';

describe('Integration Test Core API', () => {
  const apiCore = new APICore(config);

  beforeAll(async () => {
    await apiCore.fetchPathologies()

    return;
  });

  it('get pathologies', async () => {
    await apiCore.fetchPathologies();
    const result = apiCore.state.pathologies;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
    // expect(result).toHaveLength(3);
  });

  it('get variables', async () => {
    const pathologies = apiCore.state.pathologies;
    const pathology = (pathologies && pathologies.find((d, i) => i === 0)) || {
      code: 'dementia'
    };
    const result = apiCore.state.pathologiesVariables;
    expect(result).toBeTruthy();
    // expect(result).toHaveLength(184);
  });

  it('get datasets', async () => {
    const pathologies = apiCore.state.pathologies;
    const pathology = (pathologies && pathologies.find((d, i) => i === 0)) || {
      code: 'dementia'
    };
    const result = apiCore.state.pathologiesDatasets;
    expect(result).toBeTruthy();
    // expect(result).toHaveLength(4);
  });

  it('get algorithms', async () => {
    await apiCore.algorithms();
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
    const result = apiCore.state.pathologiesHierarchies[pathology.code];
    expect(result && result.code).toBeTruthy();
  });
});
