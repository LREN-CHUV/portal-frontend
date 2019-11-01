import APICore from '../../Core';
import config from '../../RequestHeaders';

describe('Integration Test Core API', () => {
  const apiCore = new APICore(config);

  it('get variables', async () => {
    await apiCore.setPathology('tbi');
    const result = apiCore.state.variables;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it('get datasets', async () => {
    await apiCore.datasets();
    const result = apiCore.state.datasets;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it('get methods', async () => {
    await apiCore.algorithms();
    const result = apiCore.state.algorithms;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it('get pathologies', async () => {
    await apiCore.pathologies();
    const result = apiCore.state.pathologies;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });
});
