import Result from "../Result";
import * as React from "react";
import renderer from "react-test-renderer";
import { shallow, mount } from "enzyme";
import { Panel } from "react-bootstrap";

describe("Test Experiment results", () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      experimentState: {}
    };
    wrapper = shallow(<Result {...props} />);
  });

  it("renders correctly", () => {
    expect(wrapper).toBeDefined();
    const tree = renderer.create(<Result {...props} />).toJSON();
    // console.log(JSON.stringify(tree, null, 2))
    expect(tree).toMatchSnapshot();
  });

  it("loading renders correctly", () => {
    const loading = wrapper.find(".panel-body");
    console.log(loading)
    expect(loading).to.have.lengthOf(1);
  });

  it("Not loading renders correctly", () => {
    const props = {
      experimentState: {
        experiment: {
          results: []
        }
      }
    };
    const component = shallow(<Result {...props} />);
    const loading = component.find("Panel.Body div h3");
    // expect(loading).toBeNull();
  });
});

// import Model from "../../../API/Model";
// jest.mock("../../../../components/API/Model");

// it("renders without crashing", () => {
//   const apiModel = new Model(config);
//   apiModel.one("regression1");
//   expect(apiModel.state.model.slug).toEqual("regression1");

//   const apiExperiment = new APIExperiment(config);
//   const apiCore = new APICore(config);
//   const component = renderer.create(
//     <Router>
//       <ExperimentResult
//         apiExperiment={apiExperiment}
//         apiCore={apiCore}
//         apiModel={apiModel}
//       />
//     </Router>
//   );
//   const instance = component.getInstance();
//   // expect(instance.state.model.slug).toEqual("regression1");
// });
