// tslint:disable:no-console
import { IExperimentListContainer, IExperimentResult, IExperimentContainer } from "@app/types";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Subscribe } from "unstated";
import { ExperimentListContainer } from "../containers";
import { Dropdown } from "./";

import "./Navigation.css";

interface INavigation {
  experimentContainer: IExperimentContainer;
}

class Navigation extends React.Component<RouteComponentProps<INavigation>> {
  public render() {
    return (
      <nav>
        <Subscribe to={[ExperimentListContainer]}>
          {({ state }: { state: IExperimentListContainer }) => (
            <Dropdown
              items={state.experiments}
              title="BSD"
              handleSelect={this.handleSelectExperiment}
            />
          )}
        </Subscribe>
      </nav>
    );
  }

  private handleSelectExperiment = (experiment: IExperimentResult) => {
    const { modelDefinitionId, uuid } = experiment;
    this.props.history.push(`/v3/experiment/${modelDefinitionId}/${uuid}`);
    this.props.experimentContainer.load(uuid)
  };
}

export default withRouter(Navigation);
