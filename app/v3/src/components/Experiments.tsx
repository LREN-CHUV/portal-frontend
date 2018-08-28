// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { Label } from "react-bootstrap";
import { Subscribe } from "unstated";
import { LoadData } from "../components";
import { ExperimentListContainer, ModelContainer } from "../containers";
import ParseExperiment from "./ParseExperiment";

const summary = (experiments: IExperimentResult[] | undefined) => {
  return (
    experiments &&
    experiments.map(e => (
      <Label bsStyle={e.finished ? "success" : "danger"}>
        {e.name}
      </Label>
    ))
  );
};
const renderExperiment = (experiment: IExperimentResult) => {
  return (
    <li key={experiment.uuid}>
      <ParseExperiment experiment={experiment} />
    </li>
  );
};

const renderExperiments = (experiments: IExperimentResult[] | undefined) => {
  if (experiments === undefined) {
    return <p>error</p>;
  }

  return (
    <ul>{experiments!.map(experiment => renderExperiment(experiment))}</ul>
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

            {summary(experimentListContainer.state.experiments)}
            {renderExperiments(experimentListContainer.state.experiments)}
          </div>
        )}
      </Subscribe>
    );
  }
}

export default Experiment;
