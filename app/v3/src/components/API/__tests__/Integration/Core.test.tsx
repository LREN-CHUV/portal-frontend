import APICore, { Pathology } from '../../Core';
import config from '../../RequestHeaders';

describe('Integration Test Core API', () => {
  const apiCore = new APICore(config);

  it('get variables', async () => {
    await apiCore.setPathology(Pathology.DEG);
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
    await apiCore.algorithms(true);
    const result = apiCore.state.algorithms;
    const error = apiCore.state.error;
    expect(error).toBeFalsy();
    expect(result).toBeTruthy();
  });
});
