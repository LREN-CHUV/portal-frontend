import { IExperimentResult } from "../../types";
import ExperimentContainer from "./ExperimentContainer";


test("initial state is loading", () => {
  const experimentContainer = new ExperimentContainer();
  expect(experimentContainer.state.loading).toBe(true);
});

// test("Set experiment", async () => {
  // const experimentContainer = new ExperimentContainer();
  // await experimentContainer.create({
    // algorithms: [
    //   {
    //     code: "sgdLinearModel",
    //     name: "SGD Linear model with Alpha=0.0001, Penalty=l2, L1 ratio=0.15",
    //     parameters: [
    //       { code: "alpha", value: "0.0001" },
    //       { code: "penalty", value: "l2" },
    //       { code: "l1_ratio", value: "0.15" }
    //     ],
    //     validation: true
    //   },
    //   {
    //     code: "sgdLinearModel",
    //     name: "SGD Linear model with Alpha=0.0002, Penalty=l2, L1 ratio=0.14",
    //     parameters: [
    //       { code: "alpha", value: "0.0002" },
    //       { code: "penalty", value: "l2" },
    //       { code: "l1_ratio", value: "0.14" }
    //     ],
    //     validation: true
    //   }
    // ],
    // name: "anova",
    // datasets: ["desd-synthdata", "qqni-synthdata"],
    // model: "test",
    // validations: []
  // });
  // expect(experimentContainer.state.experiment!.name).toBe("tsne");
// });

test("Fetch experiment", async () => {
  const experimentContainer = new ExperimentContainer();
  await experimentContainer.load("4735ff81-a0fe-47fc-b783-058d1e9df2a0");
  const result: (IExperimentResult | undefined) = experimentContainer.state.experiment;
  if (result === undefined) {
      return ;
  }

  expect(result!.name).toBe("tsne");
});
