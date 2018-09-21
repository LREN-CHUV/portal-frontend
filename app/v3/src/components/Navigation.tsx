// tslint:disable:no-console
import { IExperimentResult } from "@app/types";
import * as React from "react";
import { Glyphicon } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  ExperimentContainer,
  ExperimentListContainer,
  ModelContainer
} from "../containers";
import logo from "../images/hbp-logo.png";
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
      <nav className="Navigation">
        <section>
          {/* tslint:disable-next-line */}
          <a href="#" onClick={e => this.jumpToAngular(e, "/")}>
            <img src={logo} />
          </a>
        </section>
        <section>
          <a title="My data" href="/data/mydata">
            <span className="icon-bg">
              <Glyphicon glyph="menu-hamburger" />
            </span>
          </a>
          <Glyphicon glyph="menu-hamburger" />
        </section>
        <section>
          <h1>DEV</h1>
        </section>
        <section>
          <Glyphicon glyph="menu-hamburger" />
          <Glyphicon glyph="menu-hamburger" />
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
        </section>
        <section>
          <Glyphicon glyph="menu-hamburger" />
          <Glyphicon glyph="menu-hamburger" />
          <Glyphicon glyph="menu-hamburger" />
        </section>
      </nav>
    );
  }

  private jumpToAngular = (e: any, location: string) => {
    e.preventDefault();
    window.location.href = `${location}`;
  };
}

export default withRouter(Navigation);
