// tslint:disable:no-console
import {
  IExperimentResult,
  // IExperimentListContainer,
  IModelResult
} from "@app/types";
import * as React from "react";
import { Button, Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import { Dropdown } from "../components";
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

const headerDisplay = (experiment: IExperimentResult | undefined) => {
  const title = experiment && experiment.name || "undefined";
  const error = experiment && experiment.error;
  const modelDefinitionId = experiment && experiment.modelDefinitionId || "undefined model"
  
  return (
    <React.Fragment>
      <Panel.Title>Results of Experiment {title} </Panel.Title>
      <Panel.Body>
        <p>Created 2 hours ago by anonymous
        {modelDefinitionId}</p>
        {error}
        <Button bsStyle="primary">Share Experiment</Button>
      </Panel.Body>
    </React.Fragment>
  );
};

const methodDisplay = (experiment: IExperimentResult | undefined) => {
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

const contentDisplay = (experiment: IExperimentResult | undefined) => {
  if (experiment === undefined) {
    return <p>Empty</p>;
  }

  const result = experiment.error;
  if (result === undefined) {
    return experiment.error;
  }

  return <pre>{JSON.stringify(experiment, null, 2)}</pre>;
};

class Experiment extends React.Component<
  RouteComponentProps<IExperimentParams>
> {
  private experimentListContainer: ExperimentListContainer;
  private experimentContainer: ExperimentContainer;
  private modelContainer: ModelContainer;

  constructor(props: any) {
    super(props);
    this.experimentListContainer = new ExperimentListContainer();
    this.experimentContainer = new ExperimentContainer();
    this.modelContainer = new ModelContainer();
  }

  public async componentDidMount() {
    await this.experimentListContainer.load();
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return;
    }
    const { uuid, slug } = matched.params;

    await this.experimentContainer.load(uuid);
    return await this.modelContainer.load(slug);
  }

  public render() {
    return (
      <Provider
        inject={[
          this.experimentListContainer,
          this.experimentContainer,
          this.modelContainer
        ]}
      >
        <Subscribe
          to={[ExperimentListContainer, ExperimentContainer, ModelContainer]}
        >
          {(
            experimentListContainer: any,
            experimentContainer: any,
            modelContainer: any
          ) => (
            <div className="wrapper">
      
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
      </Provider>
    );
  }

  private handleSelect = (experiment: IExperimentResult) => {
    const { modelDefinitionId, uuid } = experiment;
    this.experimentContainer.load(uuid);
    this.modelContainer.load(modelDefinitionId!);
  };

  private experimentsDisplay = (
    experiments: IExperimentResult[] | undefined
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
