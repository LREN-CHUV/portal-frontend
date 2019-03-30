import React, { useEffect, useState } from 'react';
import { APICore } from '../API';
import CirclePack from './CirclePack';

interface IProps {
  apiCore: APICore;
}

export default ({ apiCore }: IProps) => {
  const [hierarchy, setHierarchy] = useState<any | undefined>(undefined);
  const d3Hierarchy = (node: any) => ({
    children: node.groups
      ? node.groups.map(d3Hierarchy)
      : node.variables.map((v:any) => ({ name: v.label })),
    name: node.label
  });

  useEffect(() => {
    (async () => {
      await apiCore.hierarchy();
      setHierarchy(d3Hierarchy(apiCore.state.hierarchy));
    })();
  }, []);

  return <CirclePack hierarchy={hierarchy} />;
};
