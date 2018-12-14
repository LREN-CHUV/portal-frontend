import { MIP } from "@app/types";
import * as React from "react";

interface IProps {
  minings?: any[];
  selectedDatasets?: MIP.API.IVariableEntity[];
}

const Boxplot = ({ minings, selectedDatasets }: IProps) => {
  return <div>Boxplot</div>;
};
export default Boxplot;
