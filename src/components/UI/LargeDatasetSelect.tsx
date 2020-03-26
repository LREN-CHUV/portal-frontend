import React from 'react';
import { Button, Checkbox } from 'react-bootstrap';
import styled from 'styled-components';

import { VariableEntity } from '../API/Core';
import { LONGITUDINAL_DATASET_TYPE } from '../constants';

interface Props {
  datasets?: VariableEntity[];
  handleSelectDataset: (e: VariableEntity) => void;
  selectedDatasets: VariableEntity[];
  isDropdown?: boolean;
}

const DropDownPanel = styled.div`
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

  hr {
    margin: 4px;
  }

  p {
    margin-bottom: 0;
  }
`;

const Panel = styled.div`
  label {
    margin-right: 8px;
  }

  .checkbox {
    position: absolute;
    margin-top: 4px;
    margin-left: -8px;
  }

  span {
    display: block;
  }

  hr {
    margin: 4px;
  }

  p {
    margin-bottom: 0;
  }
`;

export default ({
  datasets,
  handleSelectDataset,
  selectedDatasets,
  isDropdown = false
}: Props): JSX.Element => {
  const [visible, setVisible] = React.useState(!isDropdown);
  const style = visible ? undefined : { display: 'none' };

  // TODO: tag dataset as longitudinal
  const r = new RegExp(LONGITUDINAL_DATASET_TYPE);
  const ndatasets = datasets?.filter(d => !r.test(d.code));
  const ldatasets = datasets?.filter(d => r.test(d.code));

  const checkboxFor = (sets: VariableEntity[]): JSX.Element[] =>
    sets.map(dataset => (
      <span key={dataset.code}>
        <Checkbox
          inline={true}
          onChange={(): void => {
            handleSelectDataset(dataset);
          }}
          checked={selectedDatasets.map(s => s.code).includes(dataset.code)}
        >
          {dataset.label}
        </Checkbox>
      </span>
    ));

  const data = (
    <>
      {ndatasets && checkboxFor(ndatasets)}
      {ldatasets && ldatasets.length > 0 && (
        <>
          <hr />
          <p>
            <b>Longitudinal datasets</b>
          </p>
        </>
      )}
      {ldatasets && checkboxFor(ldatasets)}
    </>
  );

  return (
    <>
      {isDropdown && (
        <>
          <Button onClick={(): void => setVisible(!visible)}>
            Datasets <span className="caret"></span>
          </Button>
          <DropDownPanel style={style}>{data}</DropDownPanel>
        </>
      )}
      {!isDropdown && <Panel>{data}</Panel>}
    </>
  );
};
