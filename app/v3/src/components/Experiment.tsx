// tslint:disable:no-console
import {
  IExperimentContainer,
  // IExperimentListContainer,
  IExperimentResult,
  IModelResult,
  INode
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

  const loading = state && state.loading;
  const error = (state && state.error) || (experiment && experiment.error);

  const methodsDisplay = (thenode: INode) => (
    <Tabs defaultActiveKey={0} id="tabs-methods">
      {thenode.methods &&
        thenode.methods.map((m: any, j: number) => (
          <Tab eventKey={j} title={m.algorithm} key={j}>
            {m.mime === "text/plain+error" && (
              <div>
                <h3>An error has occured</h3>
                <p>{m.error}</p>
              </div>
            )}

            {m.mime === "application/json" &&
              m.data.map((d: any, k: number) => (
                <pre key={k}>{JSON.stringify(d, null, 2)}</pre>
              ))}
          </Tab>
        ))}
    </Tabs>
  );

  const nodesDisplay = (thenodes: INode[]) => (
    <Tabs defaultActiveKey={0} id="tabs-node">
      {thenodes &&
        thenodes.map((node: any, i: number) => (
          <Tab eventKey={i} title={node.name} key={i}>
            {methodsDisplay(node)}
          </Tab>
        ))}
    </Tabs>
  );

  return (
    <Panel>
      <Panel.Title>
        <h3>Results</h3>
      </Panel.Title>
      <Panel.Body>
        {loading ? (
          <div>
            <h3>Your experiment is currently running...</h3>
            <p>
              Please check back in a few minutes. This page will automatically
              refresh once your experiment has finished executing.
            </p>
          </div>
        ) : null}
        {error ? (
          <div>
            <h3>An error has occured</h3>
            <p>{error}</p>
          </div>
        ) : null}
        {nodes && nodes.length > 1 && nodesDisplay(nodes)}
        {nodes && nodes.length === 1 && methodsDisplay(nodes[0])}
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
    // setInterval(() => {
    //   this.experimentListContainer.load();
    //   this.experimentContainer.load(uuid);
    // }, 10000);

    // if (
    //   this.experimentContainer.state.error ||
    //   (this.experimentContainer.state.experiment &&
    //     this.experimentContainer.state.experiment.error)
    // ) {
    //   clearInterval(interval);
    // }

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
    this.props.history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
  };
}

export default withRouter(Experiment);
