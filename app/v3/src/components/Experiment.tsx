// tslint:disable:no-console
import {
  IExperimentResult,
  IModelResult,
} from "@app/types";
import moment from "moment"; // FIXME: change lib, too heavy
import * as React from "react";
import { Button, Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Dropdown, ExperimentResult } from "../components";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../containers";

import "./Experiment.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experimentListContainer: ExperimentListContainer;
  modelContainer: ModelContainer;
}

const headerDisplay = (
  experimentContainer: any | undefined,
  experiments: IExperimentResult[] | undefined,
  history: any
) => {
  const state = experimentContainer && experimentContainer.state;
  const experiment = state && state.experiment;
  const title = experiment && experiment.name;
  const modelId = experiment && experiment.modelDefinitionId;

  const handleSelectExperiment = async (
    selectedExperiment: IExperimentResult
  ) => {
    const { modelDefinitionId, uuid } = selectedExperiment;
    history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);

    const load = experimentContainer && experimentContainer.load;
    return await load(uuid);
  };

  return (
    <Panel>
      <Panel.Title className="experiment-header">
        <h3 className="item">
          Results of Experiment <strong>{title}</strong> on{" "}
          <a href={`/models/${modelId}`}>{modelId}</a>
        </h3>
        <div className="item">
          <Button bsStyle="info">SHARE EXPERIMENT</Button>
        </div>
        <div className="item">
          <Dropdown
            items={
              experiment &&
              experiments &&
              experiments.filter(
                e => e.modelDefinitionId === experiment.modelDefinitionId
              )
            }
            title="RELATED EXPERIMENTS"
            handleSelect={handleSelectExperiment}
          />
        </div>
      </Panel.Title>

      <Panel.Body>
        <h5>
          Created{" "}
          {experiment &&
            moment(new Date(experiment.created), "YYYYMMDD").fromNow()}{" "}
          by {experiment && experiment.user.username}
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
      {experiment && experiment.algorithms.map((m: any) => <p key={m}>{m}</p>)}
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

class Experiment extends React.Component<IProps> {
  public async componentDidMount() {
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return;
    }
    const { uuid, slug } = matched.params;
    const { experimentContainer, modelContainer } = this.props;

    await modelContainer.load(slug);
    return await experimentContainer.load(uuid);
  }

  public render() {
    const {
      experimentContainer,
      experimentListContainer,
      modelContainer
    } = this.props;
    return (
      <div className="Experiment">
        <div className="header">
          {headerDisplay(
            experimentContainer,
            experimentListContainer.state.experiments,
            this.props.history
          )}
        </div>

        <div className="sidebar">
          <div>
            {methodDisplay(experimentContainer.state.experiment)}
            {modelDisplay(modelContainer.state.model)}
          </div>
        </div>
        <div className="content">
          <ExperimentResult experimentState={experimentContainer.state} />
        </div>
      </div>
    );
  }
}

export default withRouter(Experiment);
