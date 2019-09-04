import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

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
import Navigation from '../UI/Navigation';
import NotFound from '../UI/NotFound';
import User from '../User/Container';

interface Props {
  appConfig: any;
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
  apiUser: APIUser;
}

//http://localhost:8080/services/login/hbp?code=H3afRQ&state=CI0y77

const Redirect = ({ apiUser, props }: { apiUser: APIUser; props: any }) => {
  apiUser.login(props.search).then(a => {
    return <div>hello</div>;
  });
  return <div>hello</div>;
};

const App = ({
  appConfig,
  apiExperiment,
  apiCore,
  apiModel,
  apiMining,
  apiUser
}: Props) => {
  return (
    <div className='App'>
      <header>
        <Navigation
          apiExperiment={apiExperiment}
          apiModel={apiModel}
          appConfig={appConfig}
        />
      </header>

      <section className='main-content'>
        {!apiUser.state.authenticated && (
          <>
            <h1>USER LOGIN ERROR</h1>
            <pre>{JSON.stringify(apiUser.state)}</pre>
          </>
        )}

        <Switch>
          <Route
            path='/services/login/hbp'
            // tslint:disable-next-line jsx-no-lambda
            render={props => <Redirect apiUser={apiUser} props={props} />}
          />
          <Route
            path='/v3/tos'
            // tslint:disable-next-line jsx-no-lambda
            render={props => (
              <TOS
              // apiUser={apiUser}
              // {...props}
              />
            )}
          />
          <Route
            path='/v3/home'
            // tslint:disable-next-line jsx-no-lambda
            render={props => (
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
            path='/v3/profile'
            // tslint:disable-next-line jsx-no-lambda
            render={props => <User apiUser={apiUser} {...props} />}
          />
          <Route
            path={['/v3/explore/:slug', '/v3/explore']}
            // tslint:disable-next-line jsx-no-lambda
            render={props => (
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
            path={['/v3/review/:slug', '/v3/review']}
            // tslint:disable-next-line jsx-no-lambda
            render={props => (
              <ExperimentReview
                apiMining={apiMining}
                apiModel={apiModel}
                apiCore={apiCore}
                {...props}
              />
            )}
          />
          <Route
            path='/v3/experiment/:slug/:uuid'
            // tslint:disable-next-line jsx-no-lambda
            render={() => (
              <ExperimentResult
                apiExperiment={apiExperiment}
                apiModel={apiModel}
                apiCore={apiCore}
              />
            )}
          />
          <Route
            exact={true}
            path='/v3/experiment/:slug'
            // tslint:disable-next-line jsx-no-lambda
            render={() => (
              <ExperimentCreate
                apiExperiment={apiExperiment}
                apiCore={apiCore}
                apiModel={apiModel}
                appConfig={appConfig}
              />
            )}
          />
          <Route
            path={['/v3/articles/:slug', '/v3/articles']}
            // tslint:disable-next-line jsx-no-lambda
            render={props => <Article apiCore={apiCore} {...props} />}
          />

          <Route component={NotFound} />
        </Switch>
      </section>
      <footer id='footer'>
        <Footer appConfig={appConfig} />
      </footer>
    </div>
  );
};

export default App;
