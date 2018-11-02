// tslint:disable:no-console
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Model } from "../..";
import {
  ExperimentContainer,
  ExperimentListContainer,
  MethodContainer,
  ModelContainer
} from "../../../containers";

import Header from "./Header";
import "./RunExperiment.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experimentListContainer: ExperimentListContainer;
  methodContainer: MethodContainer;
  modelContainer: ModelContainer;
}

class Experiment extends React.Component<IProps> {
  public async componentDidMount() {
    // Get url parameters
    const { match: matched } = this.props;
    if (!matched) {
      return;
    }
    const { slug } = matched.params;
    const { methodContainer, modelContainer } = this.props;
    await methodContainer.load();
    return await modelContainer.load(slug);
  }

  public render() {
    const {
      experimentContainer,
      experimentListContainer,
      methodContainer,
      modelContainer
    } = this.props;
    return (
      <div className="Experiment">
        <div className="header">
          <Header
            experimentContainer={experimentContainer}
            experiments={experimentListContainer.state.experiments}
            model={modelContainer.state.model}
          />
        </div>

        <div className="sidebar">
          <Panel>
            <Panel.Body>
              {methodContainer &&
                methodContainer.state &&
                methodContainer.state.methods &&
                methodContainer.state.methods &&
                methodContainer.state.methods.algorithms &&
                methodContainer.state.methods.algorithms.map((m: any) => (
                  <div key={m.code}>{m.label}</div>
                ))}
            </Panel.Body>
          </Panel>
        </div>
        <div className="content">
          <Panel>
            <Panel.Body>Content</Panel.Body>
          </Panel>
        </div>
        <div className="sidebar2">
          <Model model={modelContainer.state.model} />
        </div>
      </div>
    );
  }
}

export default withRouter(Experiment);
