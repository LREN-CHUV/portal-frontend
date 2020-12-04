import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import ExperimentReview from '../Analysis/Container';
import { APICore, APIExperiment, APIMining, APIModel, APIUser } from '../API';
import { IExperiment } from '../API/Experiment';
import ExperimentCreate from '../Create/Container';
import Explore from '../Explore/Container';
import Help from '../Help/Help';
import ExperimentResult from '../Result/Container';
import Tutorial from '../Tutorial/Tutorial';
import DataCatalog from '../UI/DataCatalog';
import Footer from '../UI/Footer';
import Galaxy from '../UI/Galaxy';
import { GlobalStyles } from '../UI/GlobalStyle';
import Navigation from '../UI/Navigation';
import NotFound from '../UI/NotFound';
import TOS from '../UI/TOS';
import User from '../User/Container';
import { history } from '../utils';
import ExperimentList from '../UI/ExperimentList';

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
            handleDelete={(uuid: string) => apiExperiment.delete({ uuid })}
            handleToggleShare={(
              uuid: string,
              experiment: Partial<IExperiment>
            ) =>
              apiExperiment.update({
                uuid,
                experiment: { shared: !experiment.shared }
              })
            }
            handleUpdateName={(uuid: string, name: string) =>
              apiExperiment.update({
                uuid,
                experiment: { name }
              })
            }
            handlePage={(page: number) => apiExperiment.list({ page })}
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
                {...props}
              />
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
