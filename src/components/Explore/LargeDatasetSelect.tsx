import React from 'react';
import { Button, Checkbox } from 'react-bootstrap';
import styled from 'styled-components';

import { VariableEntity } from '../API/Core';

interface Props {
  datasets?: VariableEntity[];
  handleSelectDataset: (e: VariableEntity) => void;
  selectedDatasets: VariableEntity[];
}

const Panel = styled.div`
  position: absolute;
  width: 320px;
  background-color: white;
  padding: 8px;
  border: 1px lightblue solid;
  margin: 2px 0;
  border-radius: 4px;

  label {
    margin-right: 8px;
  }

  .checkbox {
    position: absolute;
    margin-top: 4px;
    margin-left: -8px;
  }
`;

export default ({
  datasets,
  handleSelectDataset,
  selectedDatasets
}: Props): JSX.Element => {
  const [visible, setVisible] = React.useState(false);
  const style = visible ? undefined : { display: 'none' };

  return (
    <>
      <Button onClick={(): void => setVisible(!visible)}>
        Datasets <span className="caret"></span>
      </Button>
      <Panel style={style}>
        {datasets &&
          datasets.map(dataset => (
            <span key={dataset.code}>
              <Checkbox
                inline={true}
                onChange={(): void => {
                  handleSelectDataset(dataset);
                }}
                checked={selectedDatasets
                  .map(s => s.code)
                  .includes(dataset.code)}
              >
                {dataset.label}
              </Checkbox>
            </span>
          ))}
      </Panel>
    </>
  );
};
