// tslint:disable: jsx-no-lambda
// tslint:disable:no-console
// tslint:disable:max-classes-per-file

import * as React from "react";
import { /*Button,*/ Panel } from "react-bootstrap";
import { match } from "react-router-dom";
import { Subscribe } from "unstated";
import { ExperimentContainer } from "../containers";
import "./Experiment.css";

class LoadExperiment extends React.Component<any> {
  public componentDidMount() {
    const { load, uuid } = this.props;
    if (load) {
      load(uuid);
    }
  }

  public render() {
    return <p>test</p>;
  }
}
interface IExperimentParams {
  slug: string;
  uuid: string;
}

interface IExperimentProps {
  match?: match<IExperimentParams>;
}

class Experiment extends React.Component<IExperimentProps> {
  public render() {
    const matched = this.props.match;
    if (!matched) {
      return <p>Loading</p>;
    }

    const { uuid } = matched.params;
    return (
      <Subscribe to={[ExperimentContainer]}>
        {(experimentContainer: ExperimentContainer) => (
          <React.Fragment>
            {experimentContainer.state.loading ? <h1>Loading...</h1> : null}
            {experimentContainer.state.error ? <h1>{experimentContainer.state.error}</h1> : null}
            <Panel>
              <Panel.Heading>
                <LoadExperiment load={experimentContainer.load} uuid={uuid} />
                <h3>
                  Results of Experiment: 
                  <a>
                    {experimentContainer.state.experiment.name}
                  </a>
                </h3>
                {console.log(experimentContainer.state.experiment)}
                {/* <Button onClick={experiments.load}>Load experiments</Button>
              {experiments.state.items
                ? experiments.state.items.map(e => (
                    <Button
                      key={e.uuid}
                      onClick={() => experiment.load(e.uuid)}
                    >
                      {e.name}
                    </Button>
                  ))
                : null} */}
              </Panel.Heading>
            </Panel>
          </React.Fragment>
        )}
      </Subscribe>
    );
  }
}

export default Experiment;
