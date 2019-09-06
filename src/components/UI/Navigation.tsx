import './Navigation.css';

import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

import defaultUser from '../../images/default_user.png';
import { APIExperiment, APIModel } from '../API';
import { ExperimentResponse } from '../API/Experiment';
import Dropdown from '../UI/Dropdown';
import Helpdesk from './Helpdesk';

interface Props extends RouteComponentProps<any> {
  appConfig: any;
  apiExperiment: APIExperiment;
  apiModel: APIModel;
}

class Navigation extends React.Component<Props> {
  public render() {
    const { apiExperiment, apiModel, appConfig } = this.props;
    const instanceName = appConfig.instanceName || 'MIP';

    const unreadCount =
      (apiExperiment &&
        apiExperiment.state &&
        apiExperiment.state.experiments &&
        apiExperiment.state.experiments.filter(
          e => !e.resultsViewed && !e.results && !e.error
        ).length) ||
      undefined;

    return (
      <header id="topnav" className="navbar navbar-default navbar-fixed-top ">
        <div className="container-fluid">
          <div className="logo-area">
            <NavLink className="navbar-brand" to="/v3/home">
              Human Brain Project
            </NavLink>
          </div>

          <div className="app-instance-name">
            <h2>{instanceName}</h2>
          </div>

          <ul className="nav navbar-nav toolbar pull-right">
            <li className="toolbar-icon-bg hidden-xs">
              <NavLink
                title="Epidemiological Exploration "
                to="/v3/explore"
                activeClassName="active"
              >
                <span className="icon-bg">
                  <i>EE</i>
                </span>
              </NavLink>
            </li>

            <li className="toolbar-icon-bg hidden-xs">
              <NavLink
                title="Interactive Analysis"
                to="/v3/review"
                activeClassName="active"
              >
                <span className="icon-bg">
                  <i>IA</i>
                </span>
              </NavLink>
            </li>

            <li className="toolbar-icon-bg hidden-xs bsd">
              <span title="Biological Signature of Diseases">
                <Dropdown
                  items={apiExperiment.state.experiments}
                  title="BSD"
                  type="models"
                  // tslint:disable-next-line jsx-no-lambda
                  handleSelect={async (experiment: ExperimentResponse) => {
                    const { modelDefinitionId, uuid } = experiment;
                    this.props.history.push(
                      `/v3/experiment/${modelDefinitionId}/${uuid}`
                    );
                    await apiExperiment.markAsViewed({ uuid });
                    await apiModel.one(modelDefinitionId);

                    return await apiExperiment.one({ uuid });
                  }}
                  handleCreateNewExperiment={null}
                  noCaret={true}
                />
                {unreadCount && (
                  <span className="unread_count_badge">{unreadCount}</span>
                )}
              </span>
            </li>

            <li className="uib-dropdown toolbar-icon-bg">
              <NavLink
                title="Profile"
                to="/v3/profile"
                activeClassName="active"
              >
                <img className="img-circle" alt="anonymous" src={defaultUser} />
              </NavLink>
              <ul className="dropdown-menu userinfo arrow">
                <li>
                  <a ui-sref="profile" href="/profile">
                    <i className="ti ti-user" />
                    <span>Profile</span>
                  </a>
                </li>
                <li className="divider" />
                <li>
                  <a href="/login/logout" id="logout-link" ng-click="logout()">
                    <i className="ti ti-shift-right" />
                    <span>Sign out</span>
                  </a>
                </li>
              </ul>
            </li>

            <li className="toolbar-icon-bg hidden-xs help">
              <DropdownButton
                noCaret={true}
                bsStyle="default"
                id={'experiment-dropdown'}
                title={'?'}
              >
                <MenuItem
                  // tslint:disable-next-line jsx-no-lambda
                  onSelect={() => {
                    window.open('https://hbpmedical.github.io/documentation/');
                  }}
                >
                  <span className="glyphicon-book glyph" /> MIP Documentation
                </MenuItem>
                <MenuItem // tslint:disable-next-line jsx-no-lambda
                  onSelect={() => {
                    window.open('https://www.youtube.com/watch?v=MNWExzouMJw');
                  }}
                >
                  <span className="glyphicon-film glyph" /> MIP introduction
                  (video)
                </MenuItem>
                <div style={{ marginLeft: '28px' }}>
                  <span className="glyphicon-envelope glyph" /> Email us at{' '}
                  <a href="mailto://support@humanbrainproject.eu">
                    support@humanbrainproject.eu
                  </a>
                </div>
                <div style={{ width: '380px', padding: '1em' }}>
                  <Helpdesk />
                </div>
              </DropdownButton>
            </li>

            <li className="toolbar-trigger toolbar-icon-bg">
              <a ui-sref="hbpapps" title="App" href="/hbpapps">
                <span className="icon-bg">
                  <i
                    className="ti ti-layout-grid3-alt "
                    style={{ fontFamily: 'themify', fontWeight: 'normal' }}
                  />
                </span>
              </a>
            </li>
          </ul>
        </div>
      </header>
    );
  }

  private jumpToAngular = (e: any, location: string) => {
    e.preventDefault();
    window.location.href = `${location}`;
  };
}

export default withRouter(Navigation);
