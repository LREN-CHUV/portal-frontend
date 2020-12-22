import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import ExperimentReview from '../ExperimentAnalysis/Container';
import { APICore, APIExperiment, APIMining, APIModel, APIUser } from '../API';
import { ExperimentListQueryParameters, IExperiment } from '../API/Experiment';
import ExperimentCreate from '../ExperimentCreate/Container';
import Explore from '../ExperimentExplore/Container';
import Help from '../Help/Help';
import ExperimentResult from '../ExperimentResult/Container';
import Tutorial from '../Tutorial/Tutorial';
import DataCatalog from '../UI/DataCatalog';
import ExperimentList from '../UI/ExperimentList';
import Footer from '../UI/Footer';
import Galaxy from '../UI/Galaxy';
import { GlobalStyles } from '../UI/GlobalStyle';
import Navigation from '../UI/Navigation';
import NotFound from '../UI/NotFound';
import TOS from '../UI/TOS';
import User from '../User/Container';

export interface AppConfig {
  version?: string;
  instanceName?: string;
  ga?: string;
  datacatalogueUrl?: string | undefined;
}
interface Props {
  appConfig: AppConfig;
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
  apiUser: APIUser;
  showTutorial: boolean;
}

interface MainProps {
  showTutorial: any;
}

const Main = styled.main<MainProps>`
  margin: 0 auto;
  padding: 52px 8px;
  min-height: 100vh;

  ${(prop): string =>
    prop.showTutorial &&
    `
   :after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 1;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -moz-transition: all 0.5s;
  }
   `}
`;

const App = ({
  appConfig,
  apiExperiment,
  apiCore,
  apiModel,
  apiMining,
  apiUser,
  showTutorial
}: Props): JSX.Element => {
  return (
    <>
      <GlobalStyles />
      <header>
        <Navigation
          name={appConfig.instanceName}
          datacatalogueUrl={appConfig.datacatalogueUrl || undefined}
          logout={
            (apiUser.state.user?.username !== 'anonymous' && apiUser.logout) ||
            undefined
          }
        >
          <ExperimentList
            username={apiUser.state.user?.username}
            experimentList={apiExperiment.state.experimentList}
            handleDelete={(uuid: string): Promise<void> =>
              apiExperiment.delete({ uuid })
            }
            handleUpdate={(
              uuid: string,
              experiment: Partial<IExperiment>
            ): Promise<void> => apiExperiment.update({ uuid, experiment })}
            handleQueryParameters={useCallback(
              ({ ...params }: ExperimentListQueryParameters): Promise<void> =>
                apiExperiment.list({ ...params }),
              [apiExperiment]
            )}
          />
        </Navigation>
      </header>
      <Main showTutorial={showTutorial}>
        {showTutorial && <Tutorial />}
        <Switch>
          <Route
            path={['/', '/explore']}
            exact={true}
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <Explore
                apiCore={apiCore}
                apiMining={apiMining}
                apiModel={apiModel}
                appConfig={appConfig}
                apiUser={apiUser}
                apiExperiment={apiExperiment}
                {...props}
              ></Explore>
            )}
          />
          <Route
            path="/tos"
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <TOS apiUser={apiUser} {...props} />
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
                apiExperiment={apiExperiment}
                {...props}
              />
            )}
          />
          <Route
            path="/experiment/:uuid"
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
              />
            )}
          />
          <Route
            path="/galaxy"
            render={(): JSX.Element => <Galaxy apiCore={apiCore} />}
          />
          <Route path="/catalog" render={(): JSX.Element => <DataCatalog />} />
          <Route
            path="/profile"
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => (
              <User apiUser={apiUser} {...props} />
            )}
          />

          <Route
            path="/training"
            // tslint:disable-next-line jsx-no-lambda
            render={(props): JSX.Element => <Help />}
          />

          <Route component={NotFound} />
        </Switch>
      </Main>
      <footer>
        <Footer appConfig={appConfig} />
      </footer>
    </>
  );
};

export default App;
