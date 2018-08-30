// tslint:disable:no-console
import { IExperimentListContainer, IExperimentResult } from "@app/types";
import * as React from "react";
import { Label, Panel } from "react-bootstrap";
import { Provider, Subscribe } from "unstated";
import { ExperimentListContainer } from "../containers";
import "./Experiments.css";

const renderExperiments = (experiments: IExperimentResult[] | undefined) => {
  if (experiments === undefined) {
    return <React.Fragment />;
  }

  return (
    <div>
      {experiments.map((experiment: IExperimentResult) => {
          const nodes = experiment && experiment.nodes;
          const error = (experiment && experiment.error);
        
          const loading =  !nodes && !error;

        const status: [string, string] = loading
          ? ["loading", "info"]
          : experiment.error
            ? [experiment.error, "danger"]
            : ["OK", "success"];
        return (
          <Panel
            key={experiment.uuid}
            id="collapsible-panel-{experiment.uuid}"
            defaultExpanded={false}
          >
            <Panel.Heading>
              <Panel.Title toggle={true}>
                <div className="Experiments-wrapper">
                  <div className="box">{experiment.name} </div>
                  <div className="box">
                    <Label bsStyle={status[1]}>{status[0]}</Label>
                  </div>
                </div>
              </Panel.Title>
            </Panel.Heading>
            <Panel.Collapse>
              <Panel.Body>
                <pre>{JSON.stringify(experiment, null, 2)}</pre>
              </Panel.Body>
            </Panel.Collapse>
          </Panel>
        );
      })}
    </div>
  );
};

class Experiment extends React.Component {
  private experimentListContainer: any;

  constructor(props: any) {
    super(props);
    this.experimentListContainer = new ExperimentListContainer();
  }

  public async componentDidMount() {
    await this.experimentListContainer.load();
  }

  public render() {
    return (
      <Provider inject={[this.experimentListContainer]}>
        <Subscribe to={[ExperimentListContainer]}>
          {({ state }: { state: IExperimentListContainer }) =>
            renderExperiments(state.experiments)
          }
        </Subscribe>
      </Provider>
    );
  }
}

export default Experiment;
