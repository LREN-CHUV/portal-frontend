// tslint:disable:no-console
import * as React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { IModelResult } from "../../../types";

import "../Dropdown.css";

interface IDropdown {
  items: IModelResult[] | undefined;
  title: string;
  handleSelect: any;
  noCaret?: boolean;
}
export default ({
  items,
  title = "Current Model",
  handleSelect,
  noCaret = false
}: IDropdown) => (
  <DropdownButton
    noCaret={noCaret}
    bsStyle="default"
    id={"model-dropdown"}
    title={title}
  >
    {(items &&
      handleSelect &&
      items.map((item, i: number) => {
        
          return (
            <MenuItem
              eventKey={i}
              key={item.title}
              // tslint:disable-next-line jsx-no-lambda
              onSelect={() => handleSelect(item)}
            >
              <strong>{item.title}</strong>
            </MenuItem>
          );
        })
      
    )}
  </DropdownButton>
);
