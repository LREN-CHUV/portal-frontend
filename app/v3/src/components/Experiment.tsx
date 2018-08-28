// tslint:disable:no-console
import { IExperimentResultParsed, IModelResult } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Subscribe } from "unstated";
import { Dropdown, LoadData } from "../components";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../containers";

import "./Experiment.css";
interface IExperimentParams {
  slug: string;
  uuid: string;
}

const headerDisplay = (experiment: IExperimentResultParsed | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const result = experiment.error;
  if (result === undefined) {
    return experiment.error;
  }

  return (
    <React.Fragment>
      <Panel.Title>Results of Experiment {experiment.name} </Panel.Title>
      {/* <Panel.Body>
        Created 2 hours ago by anonymous
        <p>{result.map(r => r.algorithm)}</p>
        <Button bsStyle="primary">Share Experiment</Button>
      </Panel.Body> */}
    </React.Fragment>
  );
};

const methodDisplay = (experiment: IExperimentResultParsed | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const result = experiment.error;
  if (result === undefined) {
    return experiment.error;
  }

  return (
    <React.Fragment>
      <Panel.Title>Results of Experiment {experiment.name} </Panel.Title>
      <Panel.Body>{/* <p>{result.map(r => r.algorithm)}</p> */}</Panel.Body>
    </React.Fragment>
  );
};

const modelDisplay = (model: IModelResult | undefined) => {
  if (model === undefined) {
    return "Empty";
  }
  const query = model.query;
  if (query === undefined) {
    return "Empty";
  }

  return (
    <React.Fragment>
      <h4>Variable</h4>
      {query.variables &&
        query.variables.map((v: any) => <p key={v.code}>{v.code}</p>)}
      <h4>CoVariables</h4>
      {query.coVariables &&
        query.coVariables.map((v: any) => <p key={v.code}>{v.code}</p>)}
      {query.groupings &&
        query.groupings.map((v: any) => <p key={v.code}>{v.code}</p>)}
      <h4>Filters</h4>

      <h4>Training datasets</h4>
      {query.trainingDatasets &&
        query.trainingDatasets.map((v: any) => <p key={v.code}>{v.code}</p>)}
      <h4>Validation dataset</h4>
      {query.validationDatasets &&
        query.validationDatasets.map((v: any) => <p key={v.code}>{v.code}</p>)}
    </React.Fragment>
  );
};

const contentDisplay = (experiment: IExperimentResultParsed | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const result = experiment.error;
  if (result === undefined) {
    return experiment.error;
  }

  return <pre>{JSON.stringify(experiment, null, 2)}</pre>
};

class Experiment extends React.Component<
  RouteComponentProps<IExperimentParams>
> {
  public render() {
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return <p>Error, check you url</p>;
    }
    const { uuid, slug } = matched.params;

    return (
      <Subscribe
        to={[ExperimentListContainer, ExperimentContainer, ModelContainer]}
      >
        {(
          experimentListContainer: ExperimentListContainer,
          experimentContainer: ExperimentContainer,
          modelContainer: ModelContainer
        ) => (
          <div className="wrapper">
            <LoadData load={experimentContainer.load} id={uuid} />
            <LoadData load={modelContainer.load} id={slug} />
            <LoadData load={experimentListContainer.load} />

            {experimentContainer.state.loading ? <h1>Loading...</h1> : null}
            {experimentContainer.state.error ? (
              <h1>{experimentContainer.state.error}</h1>
            ) : null}

            <React.Fragment>
              <Panel className="header">
                {headerDisplay(experimentContainer.state.experiment)}
                {this.experimentsDisplay(
                  experimentListContainer.state.experiments
                )}
              </Panel>
              <Panel className="sidebar">
                <Panel.Title>Method</Panel.Title>
                <Panel.Body>
                  {methodDisplay(experimentContainer.state.experiment)}
                </Panel.Body>
              </Panel>
              <Panel className="sidebar2">
                <Panel.Title>Model</Panel.Title>
                <Panel.Body>
                  {modelDisplay(modelContainer.state.model)}
                </Panel.Body>
              </Panel>
              <Panel className="content">
                <Panel.Title>Results</Panel.Title>
                <Panel.Body>
                  {contentDisplay(experimentContainer.state.experiment)}
                </Panel.Body>
              </Panel>
            </React.Fragment>
          </div>
        )}
      </Subscribe>
    );
  }

  private handleSelect = (experiment: IExperimentResultParsed) => {
    const { modelDefinitionId, uuid } = experiment;
    this.props.history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
  };

  private experimentsDisplay = (
    experiments: IExperimentResultParsed[] | undefined
  ) => {
    if (experiments === undefined) {
      return <p>Empty</p>;
    }

    return (
      <Dropdown
        items={experiments}
        title="Other Experiments"
        handleSelect={this.handleSelect}
      />
    );
  };
}

export default withRouter(Experiment);
