import * as React from 'react';

export default ({ appConfig }: { appConfig: any }) => (
  <div className="clearfix container-fluid">
    <div className="row">
      <ul className="list-unstyled list-inline col-md-6">
        <li>
          <h6 className="copyright">
            © 2015-2019 Human Brain Project. All right reserved
          </h6>
        </li>
      </ul>
      <div className="col-md-6 text-right">
        {appConfig.version}
        {appConfig.version ? ' | ' : ''}Mode: {appConfig.mode}
      </div>
    </div>
  </div>
);
