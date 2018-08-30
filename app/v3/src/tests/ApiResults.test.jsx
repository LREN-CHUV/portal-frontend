// tslint:disable:no-console

import ExperimentListContainer from "../containers/Experiments/ExperimentListContainer";
import ModelContainer from "../containers/Models/ModelContainer";
import { methods, models } from "../tests/mocks";

test("Fetch experiments", async () => {
  const experimentListContainer = new ExperimentListContainer();
  await experimentListContainer.load();
  const experiments: IExperimentResult | undefined =
    experimentListContainer.state.experiments;

  expect(experiments).toBeDefined();

  experiments.forEach((experiment, index) => {
    expect(experiment.created).toBeDefined();
    expect(experiment.loading).toBeDefined();
    expect(experiment.name).toBeDefined();
    expect(experiment.resultsViewed).toBeDefined();
    expect(experiment.uuid).toBeDefined();
    expect(experiment.modelDefinitionId).toBeDefined();
    expect(experiment.user).toBeDefined();
    expect(experiment.algorithms).toBeDefined();

    if (experiment.error) {
      expect(experiment.loading).toBeFalsy();
    }

    if (experiment.nodes) {
      expect(experiment.finished).toBeDefined();
      const nodes: INode[] = experiment.nodes;
      nodes.forEach((node, i) => {
        expect(node.name).toBeDefined();
        expect(node.methods).toBeDefined();

        node.methods.forEach(method => {
          expect(method.mime).toBeDefined();
          expect(method.algorithm).toBeDefined();
          expect(method.data || method.error).toBeDefined();
        });
      });
    }
  });
});
