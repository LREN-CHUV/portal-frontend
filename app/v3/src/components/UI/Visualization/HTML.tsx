import * as React from 'react';

export default ({ doc }: { doc: any }) => (
  <iframe className="html-iframe" srcDoc={doc} width={500} height={500} allowFullScreen={true} frameBorder={0}/>
);
