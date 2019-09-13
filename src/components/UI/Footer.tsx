import * as React from 'react';

export default ({ appConfig }: { appConfig: any }): JSX.Element => (
  <div className="clearfix container-fluid">
    <div className="row">
      <ul className="list-unstyled list-inline col-md-6">
        <li>
          <h6 className="copyright">
            © 2015-2019{' '}
            <a
              href="https://www.humanbrainproject.eu/en/"
              title="The Human Brain Project Website"
            >
              Human Brain Project
            </a>
            . All right reserved
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
