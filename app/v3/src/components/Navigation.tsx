// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { withRouter } from "react-router-dom";
import { Dropdown } from "./";

import "./Navigation.css";

// interface IProps {
//   experimentContainer: any;
//   experimentListContainer: any
// }

class Navigation extends React.Component<any, any> {
  public async componentDidMount() {
    const { experimentListContainer } = this.props;
    return await experimentListContainer.load()
  }

  public render() {
    const { experimentListContainer, experimentContainer, modelContainer } = this.props;

    return (
      <nav>
        <Dropdown
          items={experimentListContainer.state.experiments}
          title="BSD"
          // tslint:disable-next-line jsx-no-lambda
          handleSelect={(experiment: IExperimentResult) => {
            const { modelDefinitionId, uuid } = experiment;
            this.props.history.push(
              `/v3/experiment/${modelDefinitionId}/${uuid}`
            );
            experimentContainer.load(uuid);
            modelContainer.load(modelDefinitionId)
          }}
        />
      </nav>
    );
  }
}

export default withRouter(Navigation);
