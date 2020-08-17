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
    <DropdownButton id={'model-dropdown'} title={title}>
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
            <strong>Reset</strong>
          </BsDropdown.Item>
          <BsDropdown.Item>---</BsDropdown.Item>
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
              <strong>{item.title}</strong>
            </BsDropdown.Item>
          );
        })}
    </DropdownButton>
  );
};
