// tslint:disable:no-console
import { IExperimentResultParsed } from "@app/types";
import * as React from "react";
import { Label, Panel } from "react-bootstrap";
import { Subscribe } from "unstated";
import { LoadData } from "../components";
import { ExperimentListContainer, ModelContainer } from "../containers";
import "./Experiments.css";

const renderExperiments = (experiments: IExperimentResultParsed[] | undefined) => {
  if (experiments === undefined) {
    return <p>error</p>;
  }

  return (
    <div>
      {experiments.map((experiment: IExperimentResultParsed) => {
        const status: [string, string] = experiment.loading
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
  public render() {
    return (
      <Subscribe to={[ExperimentListContainer, ModelContainer]}>
        {(
          experimentListContainer: ExperimentListContainer,
          modelContainer: ModelContainer
        ) => (
          <div>
            <LoadData load={experimentListContainer.load} />

            {experimentListContainer.state.loading ? <h1>Loading...</h1> : null}
            {experimentListContainer.state.error ? (
              <p>{experimentListContainer.state.error}</p>
            ) : null}

            {renderExperiments(experimentListContainer.state.experiments)}
          </div>
        )}
      </Subscribe>
    );
  }
}

export default Experiment;
