import { MIP } from "@app/types";
import * as React from "react";

interface IProps {
  experiment?: MIP.API.IExperimentResponse;
}

const Table = ({ experiment }: IProps) => (
  <div>{experiment && JSON.stringify(experiment, null, 4)}</div>
);
export default Table;
