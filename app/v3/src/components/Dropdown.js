import React from "react";
import { SplitButton, MenuItem } from "react-bootstrap";

export default ({ models = [], title = "Current Model", handleSelect }) => (
  <SplitButton
    bsStyle="default"
    bsSize="xsmall"
    id={"split-button"}
    title={title}
  >
    {models.map((m, i) => (
      <MenuItem eventKey={i} key={m.slug} onSelect={handleSelect}>
        {m.title}
      </MenuItem>
    ))}
  </SplitButton>
);
