import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

export default ({ items = [], title = "Current Model", handleSelect }) => (
  <DropdownButton
    bsStyle="default"
    bsSize="small"
    id={"dropdown-basic"}
    title={title}
  >
    {items.map((m, i) => (
      <MenuItem eventKey={i} key={m.uuid} onSelect={() => handleSelect(m)}>
        {m.name}
      </MenuItem>
    ))}
  </DropdownButton>
);
