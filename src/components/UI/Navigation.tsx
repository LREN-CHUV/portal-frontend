import * as React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

import defaultUser from '../../images/default_user.png';
import logo from '../../images/hbp-logo.png';
import { APIExperiment, APIModel } from '../API';
import { ExperimentResponse } from '../API/Experiment';
import Dropdown from '../UI/Dropdown';
import HelpButton from './HelpButton';
import { NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import styled from 'styled-components';
interface Props {
  appConfig: any;
  apiExperiment: APIExperiment;
  apiModel: APIModel;
}

const NavBar = styled.nav`
  font-family: 'Open Sans Condensed';
  background: #00000077;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16px;
  box-shadow: 2px 2px 2px #333;

  a:link,
  a:visited {
    color: #fff;
    text-decoration: none;
  }

  a:hover,
  a:active {
    color: #ccc;
    text-decoration: none;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 0 16px;
  height: 44px;

  font-size: 32px;
  font-weight: bold;

  div {
    background: url(${logo}) left center no-repeat;
    width: 40px;
    height: 40px;
  }
`;

const Links = styled.div`
  display: flex;
  margin: 0 16px 0 0;

  .active {
    color: #5bc0de !important;
  }
`;

const RightLinks = styled(Links)`
  display: flex;
  align-items: center;
  margin-left: auto;

  button {
    color: white;
  }
`;

const Link = styled(NavLink)`
  margin: 0 16px 0 0;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  margin: 0 16px;
  span {
    color: white;
    margin: 0 8px 0 0;
  }
`;

const GroupLink = styled(Link)`
  margin: 0 8px 0 0;
`;

export default ({ apiExperiment, apiModel, appConfig }: Props): JSX.Element => {
  const instanceName = appConfig.instanceName || 'MIP';
  return (
    <NavBar>
      <Brand>
        <Link to="/">
          <div title="Human Brain Project"></div>
        </Link>
        <Link to="/">{instanceName}</Link>
      </Brand>
      <Links>
        <Group>
          <GroupLink to="/explore">Explore</GroupLink>
          <span> &gt; </span>
          <GroupLink to="/review">Analysis</GroupLink>
          <span> &gt; </span>
          <GroupLink to="/experiment">New experiment</GroupLink>
        </Group>
        <Link to="/galaxy">Workflow</Link>
        <Link to="/articles">Articles</Link>
      </Links>
      <RightLinks>
        <Link to="/profile">Profile</Link>
        <HelpButton />
      </RightLinks>
    </NavBar>
  );
};

// const { apiExperiment, apiModel, appConfig } = this.props;
// const instanceName = appConfig.instanceName || 'MIP';

// const unreadCount =
//   (apiExperiment &&
//     apiExperiment.state &&
//     apiExperiment.state.experiments &&
//     apiExperiment.state.experiments.filter(
//       e => !e.resultsViewed && !e.results && !e.error
//     ).length) ||
//   undefined;

// export default withRouter(Navigation);

//     <header id="topnav" className="navbar navbar-default navbar-fixed-top ">
//       <div className="container-fluid">
//         <div className="logo-area">
//           <NavLink className="navbar-brand" to="/">
//             Human Brain Project
//           </NavLink>
//         </div>

//         <div className="app-instance-name">
//           <h2>{instanceName}</h2>
//         </div>

//         <ul className="nav navbar-nav toolbar pull-right">
//           <li className="toolbar-icon-bg hidden-xs">
//             <NavLink
//               title="Epidemiological Exploration "
//               to="/explore"
//               activeClassName="active"
//             >
//               <span className="icon-bg">
//                 <i>EE</i>
//               </span>
//             </NavLink>
//           </li>

//           <li className="toolbar-icon-bg hidden-xs">
//             <NavLink
//               title="Interactive Analysis"
//               to="/review"
//               activeClassName="active"
//             >
//               <span className="icon-bg">
//                 <i>IA</i>
//               </span>
//             </NavLink>
//           </li>

//           <li className="toolbar-icon-bg hidden-xs bsd">
//             <span title="Biological Signature of Diseases">
//               <Dropdown
//                 items={apiExperiment.state.experiments}
//                 title="BSD"
//                 type="models"
//                 // tslint:disable-next-line jsx-no-lambda
//                 handleSelect={async (experiment: ExperimentResponse) => {
//                   const { modelDefinitionId, uuid } = experiment;
//                   this.props.history.push(
//                     `/experiment/${modelDefinitionId}/${uuid}`
//                   );
//                   await apiExperiment.markAsViewed({ uuid });
//                   await apiModel.one(modelDefinitionId);

//                   return await apiExperiment.one({ uuid });
//                 }}
//                 handleCreateNewExperiment={null}
//                 noCaret={true}
//               />
//               {unreadCount && (
//                 <span className="unread_count_badge">{unreadCount}</span>
//               )}
//             </span>
//           </li>

//           <li
//             className="toolbar-icon-bg hidden-xs wf"
//             style={{ marginLeft: '16px' }}
//           >
//             <NavLink
//               title="Galaxy Workflow"
//               to="/galaxy"
//               activeClassName="active"
//             >
//               <span className="icon-bg">
//                 <i>WF</i>
//               </span>
//             </NavLink>
//           </li>

//           <li
//             className="uib-dropdown toolbar-icon-bg"
//             style={{ marginLeft: '16px' }}
//           >
//             <NavLink title="Profile" to="/profile" activeClassName="active">
//               {/* <img className="img-circle" alt="anonymous" src={defaultUser} /> */}
//             </NavLink>
//             <ul className="dropdown-menu userinfo arrow">
//               <li>
//                 <a ui-sref="profile" href="/profile">
//                   <i className="ti ti-user" />
//                   <span>Profile</span>
//                 </a>
//               </li>
//               <li className="divider" />
//               <li>
//                 <a href="/login/logout" id="logout-link" ng-click="logout()">
//                   <i className="ti ti-shift-right" />
//                   <span>Sign out</span>
//                 </a>
//               </li>
//             </ul>
//           </li>

//           <li className="toolbar-icon-bg hidden-xs help">
//             <HelpButton />
//           </li>

//           {/* <li className="toolbar-trigger toolbar-icon-bg">
//             <a ui-sref="hbpapps" title="App" href="/hbpapps">
//               <span className="icon-bg">
//                 <i
//                   className="ti ti-layout-grid3-alt "
//                   style={{ fontFamily: 'themify', fontWeight: 'normal' }}
//                 />
//               </span>
//             </a>
//           </li> */}
//         </ul>
//       </div>
//     </header>
//   );
// }
