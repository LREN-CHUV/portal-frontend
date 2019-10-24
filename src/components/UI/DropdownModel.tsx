import React, { useEffect, useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { ModelResponse } from '../API/Model';

interface Dropdown {
  items: ModelResponse[] | undefined;
  selectedSlug?: string;
  reset?: boolean;
  handleSelect: (model?: ModelResponse) => void;
}
export default ({
  items,
  handleSelect,
  reset = false,
  selectedSlug
}: Dropdown): JSX.Element => {
  const [title, setTitle] = useState(selectedSlug || 'Select');
  useEffect(() => {
    if (selectedSlug) {
      const f = items && items.find(i => i.slug === selectedSlug);
      if (f && f.title) {
        setTitle(f.title);
      }
    }
  }, [selectedSlug, items]);

  return (
    <DropdownButton bsSize="small" id={'model-dropdown'} title={title}>
      {reset && (
        <>
          <MenuItem
            eventKey={'reset'}
            key={'reset'}
            // tslint:disable-next-line jsx-no-lambda
            onSelect={() => {
              setTitle('undefined');
              handleSelect();
            }}
          >
            <strong>Reset</strong>
          </MenuItem>
          <MenuItem>---</MenuItem>
        </>
      )}

      {items &&
        handleSelect &&
        items.map((item, i: number) => {
          return (
            <MenuItem
              eventKey={i}
              key={item.title}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={(): void => {
                setTitle((item && item.title) || 'edit');
                handleSelect(item);
              }}
            >
              <strong>{item.title}</strong>
            </MenuItem>
          );
        })}
    </DropdownButton>
  );
};
