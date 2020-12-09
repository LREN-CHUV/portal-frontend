import React, { useState } from 'react';
import { IExperiment, IExperimentList } from '../API/Experiment';

interface Props {
  experimentList?: IExperimentList;
}

export default (): JSX.Element => {
  const [searchName, setSearchName] = useState<string>('');

  return <div>Experiments Model</div>;
};
