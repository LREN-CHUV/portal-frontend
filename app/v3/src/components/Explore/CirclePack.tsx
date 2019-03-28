import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const CirclePack = (props: any) => {
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    d3render();
  });

  const d3render = () => {
    const scale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([0, 200]);
    const axis = d3.axisBottom(scale);

    const node = gRef.current;
    if (node) {
      d3.select(node).call(axis);
    }
  };

  return <g transform={`translate(10, ${props.y})`} ref={gRef} />;
};

export default CirclePack;
