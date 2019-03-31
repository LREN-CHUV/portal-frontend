import React, { useEffect, useState } from 'react';
import { APICore } from '../API';
import CirclePack from './CirclePack';

interface IProps {
  apiCore: APICore;
}

export default ({ apiCore }: IProps) => {
  const [hierarchy, setHierarchy] = useState<any | undefined>(undefined);
  const d3Hierarchy = (node: any) => ({
    children: [
      ...(node.groups && node.groups.map(d3Hierarchy) || []),
      ...(node.variables && node.variables.map((v: any) => ({
        code: v.code,
        description: v.description,
        name: v.label
      })) || [])
    ],
    code: node.code,
    description: node.description,
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
