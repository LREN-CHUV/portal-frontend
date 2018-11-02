// tslint:disable:no-console
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Model } from "../..";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ExploreContainer,
  MethodContainer,
  ModelContainer
} from "../../../containers";

import Header from "./Header";
import "./RunExperiment.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experimentListContainer: ExperimentListContainer;
  exploreContainer: ExploreContainer;
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
    const { exploreContainer, methodContainer, modelContainer } = this.props;
    await methodContainer.load();
    await exploreContainer.variables();
    await modelContainer.all();
    return await modelContainer.load(slug);
  }

  public render() {
    const {
      experimentContainer,
      experimentListContainer,
      exploreContainer,
      methodContainer,
      modelContainer
    } = this.props;
    const algorithms =
      (methodContainer &&
        methodContainer.state &&
        methodContainer.state.methods &&
        methodContainer.state.methods &&
        methodContainer.state.methods.algorithms &&
        methodContainer.state.methods.algorithms) ||
      [];

    const rawVariables = exploreContainer.state.variables;

    const query =
      modelContainer.state.model && modelContainer.state.model.query;
    const modelVariable =
      query && query.variables && query.variables.map(v => v.code)[0];
    const modelCovariables =
      (query && query.coVariables && query.coVariables.map(v => v.code)) || [];
    const modelGroupings =
      (query && query.coVariables && query.coVariables.map(v => v.code)) || [];

    return (
      <div className="Experiment">
        <div className="header">
          <Header
            experimentContainer={experimentContainer}
            experiments={experimentListContainer.state.experiments}
            modelContainer={modelContainer}
          />
        </div>

        <div className="sidebar">
          <Panel>
            <Panel.Body>
              {rawVariables &&
                query &&
                modelVariable &&
                algorithms
                  .map((algorithm: any) => {
                    const rawVariable = rawVariables.find(
                      (v: any) => v.code === modelVariable
                    );
                    const algoConstraints: any = algorithm.constraints;

                    const disabled = { ...algorithm, enabled: false };
                    
                    const algoConstraintVariable = algoConstraints.variable;
                    const type = rawVariable && rawVariable.type;
                    if (type) {
                      if (algoConstraintVariable.binominal && type === "binominal") {
                        return disabled;
                      }
                      if (algoConstraintVariable.integer && type === "integer") {
                        return disabled;
                      }
                      if (algoConstraintVariable.polynominal && type === "polynominal") {
                        return disabled;
                      }
                      if (algoConstraintVariable.real && type === "real") {
                        return disabled;
                      }
                    }

                    const algoConstraintCovariable = algoConstraints.covariables;
                    if (
                      modelCovariables.length < algoConstraintCovariable &&
                      algoConstraintCovariable.min_count
                    ) {
                      return disabled;
                    }

                    if (
                      modelCovariables.length < algoConstraintCovariable &&
                      algoConstraintCovariable.max_count
                    ) {
                      return disabled;
                    }

                    const algoConstraintGrouping = algoConstraints.groupings;
                    if (
                      modelGroupings.length < algoConstraintGrouping &&
                      algoConstraintGrouping.min_count
                    ) {
                      return disabled;
                    }

                    if (
                      modelGroupings.length < algoConstraintGrouping &&
                      algoConstraintGrouping.max_count
                    ) {
                      return disabled;
                    }

                    const mixed = algoConstraints.mixed;
                    if (
                      modelGroupings.length > 0 &&
                      modelCovariables.length > 0 &&
                      !mixed
                    ) {
                      return disabled;
                    }

                    return { ...algorithm, enabled: true };
                  })
                  .map((a: any) => (
                    <div
                      title={a.description}
                      key={a.code}
                      style={a.enabled ? { color: "green" } : { color: "gray" }}
                    >
                      {a.label}
                    </div>
                  ))}
            </Panel.Body>
          </Panel>
        </div>
        <div className="content">
          <Panel>
            <Panel.Body>content</Panel.Body>
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
