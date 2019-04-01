import React from 'react';

export default ({ histograms }: { histograms: any }) => (
  <div>{histograms && <pre>{JSON.stringify(histograms, null, 2)}</pre>}</div>
);
