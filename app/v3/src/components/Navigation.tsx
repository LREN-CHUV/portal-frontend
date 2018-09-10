// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../containers";
import { Dropdown } from "./";

import "./Navigation.css";

interface IProps extends RouteComponentProps<any> {
  experimentContainer: ExperimentContainer;
  experimentListContainer: ExperimentListContainer;
  modelContainer: ModelContainer;
}

class Navigation extends React.Component<IProps> {
  public async componentDidMount() {
    const { experimentListContainer } = this.props;
    return await experimentListContainer.load();
  }

  public render() {
    const {
      experimentListContainer,
      experimentContainer,
      modelContainer
    } = this.props;

    return (
      <nav>
        <Dropdown
          items={experimentListContainer.state.experiments}
          title="BSD"
          // tslint:disable-next-line jsx-no-lambda
          handleSelect={async (experiment: IExperimentResult) => {
            const { modelDefinitionId, uuid } = experiment;
            this.props.history.push(
              `/v3/experiment/${modelDefinitionId}/${uuid}`
            );
            await experimentContainer.markAsViewed(uuid);
            await modelContainer.load(modelDefinitionId);

            return await experimentContainer.load(uuid);
          }}
        />
      </nav>
    );
  }
}

export default withRouter(Navigation);
