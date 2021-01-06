import * as React from 'react';

export default ({ doc }: { doc: any }): JSX.Element => (
  <iframe
    title="HTML results"
    className="html-iframe"
    srcDoc={doc}
    width={500}
    height={500}
    allowFullScreen={true}
    frameBorder={0}
  />
);
