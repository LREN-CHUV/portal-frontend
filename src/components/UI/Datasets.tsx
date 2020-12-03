import * as React from 'react';

import { ModelResponse } from '../API/Model';

interface Props {
  model?: ModelResponse;
}

class Model extends React.Component<Props> {
  render(): JSX.Element {
    const { model } = this.props;

    const query = model && model.query;

    return (
      <>
        {query && query.trainingDatasets && (
          <>
            <h4>Datasets</h4>
            {query.trainingDatasets.map((v: any) => (
              <p key={v.code}>{v.code}</p>
            ))}
          </>
        )}
      </>
    );
  }
}

export default Model;
