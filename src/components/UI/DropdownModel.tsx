import React, { useEffect, useState } from 'react';
import { DropdownButton, Dropdown as BsDropdown } from 'react-bootstrap';
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
  const [title, setTitle] = useState(selectedSlug || 'Select from model');
  useEffect(() => {
    if (selectedSlug) {
      const f = items && items.find(i => i.slug === selectedSlug);
      if (f && f.title) {
        setTitle(f.title);
      }
    }
  }, [selectedSlug, items]);

  return (
    <DropdownButton
      id={'model-dropdown'}
      title={title}
      size="sm"
      variant="light"
    >
      {reset && (
        <>
          <BsDropdown.Item
            eventKey={'reset'}
            key={'reset'}
            // tslint:disable-next-line jsx-no-lambda
            onSelect={() => {
              setTitle('undefined');
              handleSelect();
            }}
          >
            Reset
          </BsDropdown.Item>
          <BsDropdown.ItemText>-------</BsDropdown.ItemText>
        </>
      )}

      {items &&
        handleSelect &&
        items.map((item, i: number) => {
          return (
            <BsDropdown.Item
              eventKey={`${i}`}
              key={item.title}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={(): void => {
                setTitle((item && item.title) || 'edit');
                handleSelect(item);
              }}
            >
              {item.title}
            </BsDropdown.Item>
          );
        })}
    </DropdownButton>
  );
};
