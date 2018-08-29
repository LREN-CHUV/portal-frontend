// tslint:disable:no-console
import {
  IExperimentContainer,
  // IExperimentListContainer,
  IExperimentResult,
  IModelResult
} from "@app/types";
import * as moment from "moment";

import * as React from "react";
import { Button, Panel, Tab, Tabs } from "react-bootstrap";
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

const headerDisplay = (
  experiment: IExperimentResult | undefined,
  experiments: IExperimentResult[] | undefined,
  handleSelect: any
) => {
  const title = (experiment && experiment.name) || "undefined";
  const modelDefinitionId =
    (experiment && experiment.modelDefinitionId) || "undefined model";

  return (
    <Panel>
      <Panel.Title className="experiment-header">
        <h3 className="item">
          Results of Experiment <strong>{title}</strong> on{" "}
          <a href={`/models/${modelDefinitionId}`}>{modelDefinitionId}</a>
        </h3>
        <div className="item">
          <Button bsStyle="info">SHARE EXPERIMENT</Button>
        </div>
        <div className="item">
          <Dropdown
            items={experiments}
            title="RELATED EXPERIMENTS"
            handleSelect={handleSelect}
          />
        </div>
      </Panel.Title>

      <Panel.Body>
        <h5>
          Created{" "}
          {experiment && moment(experiment.created, "YYYYMMDD").fromNow()} by{" "}
          {experiment && experiment.user.username}
        </h5>
      </Panel.Body>
    </Panel>
  );
};

const methodDisplay = (experiment: IExperimentResult | undefined) => (
  <Panel>
    <Panel.Title>
      <h3>Methods</h3>
    </Panel.Title>
    <Panel.Body>
      <ul>
        {experiment &&
          experiment.algorithms.map((m: any) => <li key={m}>{m}</li>)}
      </ul>
    </Panel.Body>
  </Panel>
);

const modelDisplay = (model: IModelResult | undefined) => {
  return (
    <Panel>
      <Panel.Title>
        <h3>Model {model && model.title}</h3>
      </Panel.Title>
      {model &&
        model.query && (
          <Panel.Body>
            {model.query.variables && <h5>Variables</h5>}
            {model.query.variables &&
              model.query.variables.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.coVariables && <h5>CoVariables</h5>}
            {model.query.coVariables &&
              model.query.coVariables.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.groupings &&
              model.query.groupings.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.filters && <h5>Filters</h5>}
            {model.query.filters}

            {model.query.trainingDatasets && <h5>Training datasets</h5>}
            {model.query.trainingDatasets &&
              model.query.trainingDatasets.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.validationDatasets && <h5>Validation dataset</h5>}
            {model.query.validationDatasets &&
              model.query.validationDatasets.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
          </Panel.Body>
        )}
    </Panel>
  );
};

const contentDisplay = (state: IExperimentContainer | undefined) => {
  const experiment = state && state.experiment;
  const nodes = experiment && experiment.nodes;

  return (
    <Panel>
      <Panel.Title>
        <h3>Results</h3>
      </Panel.Title>
      <Panel.Body>
        {state && state.loading ? <p>Loading...</p> : null}
        {state && state.error ? <p>{state.error}</p> : null}
        <Tabs defaultActiveKey={0} id="tabs-node">
          {nodes &&
            nodes.map((n: any, i: number) => (
              <Tab eventKey={i} title={n.name}>
                <Tabs defaultActiveKey={0} id="tabs-methods">
                  {n.methods &&
                    n.methods.map((m: any, j: number) => (
                      <Tab eventKey={j} title={m.algorithm}>
                        <pre>{JSON.stringify(m, null, 4)}</pre>
                      </Tab>
                    ))}
                </Tabs>
              </Tab>
            ))}
        </Tabs>
      </Panel.Body>
    </Panel>
  );
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

    this.handleSelectExperiment = this.handleSelectExperiment.bind(this);
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
      <div className="Experiment">
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
                <React.Fragment>
                  <div className="header">
                    {headerDisplay(
                      experimentContainer.state.experiment,
                      experimentListContainer.state.experiments,
                      this.handleSelectExperiment
                    )}
                  </div>
                  <div className="sidebar">
                    <div>
                      {methodDisplay(experimentContainer.state.experiment)}
                      {modelDisplay(modelContainer.state.model)}
                    </div>
                  </div>
                  <div className="content">
                    {contentDisplay(experimentContainer.state)}
                  </div>
                </React.Fragment>
              </div>
            )}
          </Subscribe>
        </Provider>
      </div>
    );
  }

  private handleSelectExperiment = (experiment: IExperimentResult) => {
    const { modelDefinitionId, uuid } = experiment;
    this.experimentContainer.load(uuid);
    this.modelContainer.load(modelDefinitionId!);
  };
}

export default withRouter(Experiment);
