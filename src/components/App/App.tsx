import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APICore, APIExperiment, APIMining, APIModel, APIUser } from '../API';
import Article from '../Article/Container';
import ExperimentCreate from '../Create/Container';
import Explore from '../Explore/Container';
import Home from '../Home/Container';
import TOS from '../Home/TOS';
import ExperimentResult from '../Result/Container';
import ExperimentReview from '../Review/Container';
import Footer from '../UI/Footer';
import Galaxy from '../UI/Galaxy';
import Navigation from '../UI/Navigation';
import NotFound from '../UI/NotFound';

import User from '../User/Container';
import './App.css';

import styled from 'styled-components';

export enum InstanceMode {
  Local,
  Federation
}
export interface AppConfig {
  version?: string;
  instanceName?: string;
  mode?: InstanceMode;
  ga?: string;
  galaxyAPIUrl?: string;
  galaxyApacheUrl?: string;
}
interface Props {
  appConfig: AppConfig;
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
  apiUser: APIUser;
}

const Content = styled.section`
  margin-top: 116px;
`;

const App = ({
  appConfig,
  apiExperiment,
  apiCore,
  apiModel,
  apiMining,
  apiUser
}: Props): JSX.Element => {
  return (
    <div className="App">
      <header>
        <Navigation
          apiExperiment={apiExperiment}
          apiModel={apiModel}
          appConfig={appConfig}
        />
      </header>

      <Content className="main-content">
        <Switch>
          <Route
            path="/galaxy"
            render={(): JSX.Element => <Galaxy appConfig={appConfig} />}
          />
          <Route
            path="/tos"
            // tslint:disable-next-line jsx-no-lambda
            render={(): JSX.Element => (
              <TOS
              // apiUser={apiUser}
              // {...props}
              />
            )}
          />
          <Route
            path="/"
            exact={true}
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <Home
                apiCore={apiCore}
                apiModel={apiModel}
                apiExperiment={apiExperiment}
                apiUser={apiUser}
                {...props}
              />
            )}
          />
          <Route
            path="/profile"
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <User apiUser={apiUser} {...props} />
            )}
          />
          <Route
            path="/explore"
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <Explore
                apiCore={apiCore}
                apiMining={apiMining}
                apiModel={apiModel}
                appConfig={appConfig}
                {...props}
              />
            )}
          />
          <Route
            path="/review"
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <ExperimentReview
                apiMining={apiMining}
                apiModel={apiModel}
                apiCore={apiCore}
                appConfig={appConfig}
                {...props}
              />
            )}
          />
          <Route
            path="/experiment/:slug/:uuid"
            // tslint:disable-next-line jsx-no-lambda
            render={(): JSX.Element => (
              <ExperimentResult
                apiExperiment={apiExperiment}
                apiModel={apiModel}
                apiCore={apiCore}
              />
            )}
          />
          <Route
            exact={true}
            path="/experiment"
            // tslint:disable-next-line jsx-no-lambda
            render={(): JSX.Element => (
              <ExperimentCreate
                apiExperiment={apiExperiment}
                apiCore={apiCore}
                apiModel={apiModel}
                appConfig={appConfig}
              />
            )}
          />
          <Route
            path={['/articles/:slug', '/articles']}
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <Article apiCore={apiCore} {...props} />
            )}
          />

          <Route component={NotFound} />
        </Switch>
      </Content>
      <footer id="footer">
        <Footer appConfig={appConfig} />
      </footer>
    </div>
  );
};

export default App;
