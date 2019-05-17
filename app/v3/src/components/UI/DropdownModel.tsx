import React, { useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { ModelResponse } from '../API/Model';
import './Dropdown.css';

interface Dropdown {
  items: ModelResponse[] | undefined;
  title?: string;
  handleSelect: any;
  noCaret?: boolean;
}
export default ({ items, handleSelect, noCaret = false }: Dropdown) => {
  const [title, setTitle] = useState('New model');

  return (
    <DropdownButton
      noCaret={false}
      bsSize='small'
      id={'model-dropdown'}
      title={title}>
      {items &&
        handleSelect &&
        items.map((item, i: number) => {
          return (
            <MenuItem
              eventKey={i}
              key={item.title}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => {
                setTitle(item.title);
                handleSelect(item);
              }}>
              <strong>{item.title}</strong>
            </MenuItem>
          );
        })}
    </DropdownButton>
  );
};
