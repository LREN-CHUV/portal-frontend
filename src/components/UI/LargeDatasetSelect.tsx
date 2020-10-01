import React from 'react';
import { Button, Form } from 'react-bootstrap';
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
    font-size: 0.8rem;
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
}`;

const CaretButton = styled(Button)`
  ::after {
    display: inline-block;
    margin-left: 0.255em;
    vertical-align: 0.255em;
    content: '';
    border-top: 0.3em solid;
    border-right: 0.3em solid transparent;
    border-bottom: 0;
    border-left: 0.3em solid transparent;
  }
`;

const Card = styled.div`
  label {
    margin-right: 8px;
    font-size: 0.8rem;
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
    margin: 6px 0;
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
        <Form.Check
          inline={true}
          type="checkbox"
          id={`default-${dataset.code}`}
          label={dataset.label}
          onChange={(): void => {
            handleSelectDataset(dataset);
          }}
          checked={selectedDatasets.map(s => s.code).includes(dataset.code)}
        ></Form.Check>
      </span>
    ));

  const data = (
    <>
      {ndatasets && checkboxFor(ndatasets)}
      {ldatasets && ldatasets.length > 0 && (
        <>
          <hr />
          <h5>Longitudinal datasets</h5>
        </>
      )}
      {ldatasets && checkboxFor(ldatasets)}
    </>
  );

  return (
    <>
      {isDropdown && (
        <>
          <CaretButton
            variant="light"
            id="dropdown-basic"
            size="sm"
            onClick={(): void => setVisible(!visible)}
          >
            Datasets
          </CaretButton>
          <DropDownPanel style={style}>{data}</DropDownPanel>
        </>
      )}
      {!isDropdown && (
        <>
          {datasets && <h4>Datasets</h4>}
          <Card>{data}</Card>
        </>
      )}
    </>
  );
};
