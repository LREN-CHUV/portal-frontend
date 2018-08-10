// tslint:disable:no-console
import * as React from "react";
import { Button, Panel } from "react-bootstrap";
import {  RouteComponentProps, withRouter } from "react-router-dom";
import { Subscribe } from "unstated";
import {
  ExperimentContainer,
  ExperimentsContainer,
  ModelContainer
} from "../containers";
import { IExperimentResult, IModelResult } from "../types";
import { Dropdown, LoadExperiment, LoadModel } from "./";


import "./Experiment.css";
interface IExperimentParams {
  slug: string;
  uuid: string;
}

// interface IExperimentProps {
//   match?: match<IExperimentParams>;
//   history: any
// }

const headerDisplay = (experiment: IExperimentResult | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const result = experiment.result
  if (result === undefined) {
    return "No result"
  }

  return (
    <React.Fragment>
      <Panel.Title>Results of Experiment {experiment.name} </Panel.Title>
      <Panel.Body>
        Created 2 hours ago by anonymous
        <p>{result.map(r => r.algorithm)}</p>
        <Button bsStyle="primary">Share Experiment</Button>
      </Panel.Body>
    </React.Fragment>
  );
};



const methodDisplay = (experiment: IExperimentResult | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const result = experiment.result
  if (result === undefined) {
    return "No result"
  }

  return (
    <React.Fragment>
      <Panel.Title>Results of Experiment {experiment.name} </Panel.Title>
      <Panel.Body>
        <p>{result.map(r => r.algorithm)}</p>
      </Panel.Body>
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
      <h5>Variable</h5>
      {query.variables &&
        query.variables.map((v: any) => <p key={v.code}>{v.code}</p>)}
      <h5>CoVariables</h5>
      {query.coVariables &&
        query.coVariables.map((v: any) => <p key={v.code}>{v.code}</p>)}
      {query.groupings &&
        query.groupings.map((v: any) => <p key={v.code}>{v.code}</p>)}
      <h5>Filters</h5>

      <h5>Training datasets</h5>
      {query.trainingDatasets &&
        query.trainingDatasets.map((v: any) => <p key={v.code}>{v.code}</p>)}
      <h5>Validation dataset</h5>
      {query.validationDatasets &&
        query.validationDatasets.map((v: any) => <p key={v.code}>{v.code}</p>)}
    </React.Fragment>
  );
};

const contentDisplay = (experiment: IExperimentResult | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const results = experiment.result;
  if (results === undefined) {
    return "";
  }

  return results.map(r => (
    <pre key="{r.jobId}">{JSON.stringify(r.data, null, 4)}</pre>
  ));
};

class Experiment extends React.Component<RouteComponentProps<IExperimentParams>> {

  public render() {
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return <p>Error, check you url</p>;
    }
    const { uuid, slug } = matched.params;

    return (
      <Subscribe
        to={[ExperimentsContainer, ExperimentContainer, ModelContainer]}
      >
        {(
          experimentsContainer: ExperimentsContainer,
          experimentContainer: ExperimentContainer,
          modelContainer: ModelContainer
        ) => (
          <div className="wrapper">
            <LoadExperiment load={experimentContainer.load} uuid={uuid} />
            <LoadModel load={modelContainer.load} slug={slug} />
            <LoadModel load={experimentsContainer.load} slug={slug} />

            {experimentContainer.state.loading ? <h1>Loading...</h1> : null}
            {experimentContainer.state.error ? (
              <h1>{experimentContainer.state.error}</h1>
            ) : null}

            <React.Fragment>
              <Panel className="header">
                {headerDisplay(experimentContainer.state.experiment)}
                {this.experimentsDisplay(experimentsContainer.state.experiments)}
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

  private handleSelect = (experiment: IExperimentResult) => {
    const { model: { slug }, uuid} = experiment;
    this.props.history.push(`/v3/experiment/${slug}/${uuid}`)
  }
  
  private experimentsDisplay = (experiments: IExperimentResult[] | undefined) => {
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
