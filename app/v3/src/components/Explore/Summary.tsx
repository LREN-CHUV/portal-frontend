import * as d3 from 'd3';
import React, { useRef } from 'react';

import { IVariableNode } from './Container';

export default ({
  selectedVariable,
  handleSelectVariable
}: {
  selectedVariable: IVariableNode | undefined;
  handleSelectVariable: (node: IVariableNode) => void;
}) => {
  const dRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = dRef.current;

  const breadcrumb = (
    variable: IVariableNode,
    paths: IVariableNode[] = []
  ): IVariableNode[] =>
    variable && variable.parent
      ? breadcrumb(variable.parent, [...paths, variable])
      : paths;

  if (selectedVariable) {
    d3.select(shortcutsRef)
      .selectAll('.shortcut')
      .data(breadcrumb(selectedVariable).reverse())
      .join('a')
      // .style('fill-opacity', d => (d.parent === root ? 1 : 0))
      // .style('display', d => (d.parent === root ? 'inline' : 'none'))
      .text(d => d.data.label)
      .on('click', d => {
        //   zoom(d);
      });
  }

  // breadcrumb(selectedVariable)
  //   .reverse()
  //   .map((v: IVariableNode) => (
  //     <a
  //       className='shortcut'
  //       // tslint:disable-next-line
  //       onClick={() => handleSelectVariable(v)}>
  //       {v.data.label}
  //     </a>
  //   ));

  return (
    <div>
      {selectedVariable && (
        <div>
          <div ref={dRef} />

          <p>
            <b>Name</b>: {selectedVariable.data.label}
          </p>
          <p>
            <b>Type</b>: {selectedVariable.data.type}
          </p>
          <p>
            <b>Description</b>: {selectedVariable.data.description}
          </p>
        </div>
      )}
    </div>
  );
};
