import React, { useEffect, useState } from 'react';
import { APICore } from '../API';
import CirclePack from './CirclePack';

interface IProps {
  apiCore: APICore;
}

const Container = ({ apiCore }: IProps) => {
  const [hierarchy, setHierarchy] = useState(null);

  useEffect(() => {
    (async () => {
      await apiCore.hierarchy();
      setHierarchy(apiCore.state.hierarchy);
    })();
  }, []);

  return <CirclePack hierarchy={hierarchy} />;
};

export default Container;
