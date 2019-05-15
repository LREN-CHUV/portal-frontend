import './Shortcuts.css';

import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import { HierarchyCircularNode } from './Container';
import { renderLifeCycle } from './renderLifeCycle';

interface Props {
  hierarchy: HierarchyCircularNode;
  zoom: Function;
  handleSelectNode: (node: HierarchyCircularNode) => void;
  // model: Model;
  // selectedNode: HierarchyCircularNode | undefined;
}

export default (props: Props) => {
  const divRef = useRef(null);
  const resultRef = useRef(null);
  const [visibleResults, setVisibleResults] = useState(false);
  const [searchResult, setSearchResult] = useState<HierarchyCircularNode[]>();
  const [keyDownIndex, setKeyDownIndex] = useState(0);
  const [enterZoom, setZoomEnter] = useState(false);
  const { hierarchy, zoom, handleSelectNode } = props;

  // console.log('Shortcuts', searchResult)
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchResult]);

  useEffect(() => {
    console.log(keyDownIndex);
  }, [keyDownIndex]);

  useEffect(() => {
    setVisibleResults(searchResult ? true : false);
    const path = d3.select(resultRef.current).selectAll('a');
    if (!searchResult) {
      path.remove();
      return;
    }

    path.remove();
    const d3results = d3
      .select(resultRef.current)
      .selectAll('a')
      .data(searchResult)
      .join('a')
      .text(d => d.data.label)
      .attr('class', (d, i) => (i === keyDownIndex ? 'selected' : ''))
      .on('click', d => {
        handleSelectNode(d);
        zoom(d);
        d3.event.stopPropagation();
      });

    if (enterZoom) {
      setZoomEnter(false);
      setVisibleResults(false);
      const d3index = d3results.filter((d, i) => i === keyDownIndex);
      d3index.dispatch('click');
    }
  }, [searchResult, keyDownIndex, enterZoom]);

  // renderLifeCycle({
  //   firstRender: () => {
  //     d3.select(divRef.current)
  //       .selectAll('.shortcut')
  //       .data(hierarchy.descendants())
  //       .join('a')
  //       .style('fill-opacity', d => (d.parent === hierarchy ? 1 : 0))
  //       .style('display', d => (d.parent === hierarchy ? 'inline' : 'none'))
  //       .text(d => d.data.label)
  //       .on('click', d => {
  //         handleSelectNode(d);

  //         d3.event.stopPropagation();
  //         zoom(d);
  //       });
  //   }
  // });

  const handleChangeInput = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!value || value.length < 2) {
      setSearchResult(undefined);

      return;
    }
    const results: HierarchyCircularNode[] = [];
    hierarchy.each(node => {
      const regexp = new RegExp(value, 'ig');
      if (regexp.test(node.data.label)) {
        results.push(node);
      }
    });

    setSearchResult(results.length > 0 ? results : undefined);
  };

  const handleBlur = () => {
    setTimeout(() => setVisibleResults(false), 250);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' && searchResult) {
      setKeyDownIndex(index =>
        index >= searchResult.length - 1 ? searchResult.length - 1 : index + 1
      );
    } else if (event.key === 'ArrowUp') {
      setKeyDownIndex(index => (index <= 0 ? 0 : index - 1));
    } else if (event.key === 'Enter') {
      setZoomEnter(true);
    }
  };

  return (
    <div className='shortcuts'>
      {/* <div className='d3-link' ref={divRef} /> */}
      <input
        placeholder='Search'
        onFocus={() => setVisibleResults(searchResult ? true : false)}
        onBlur={handleBlur}
        onChange={handleChangeInput}
      />
      <div
        className={`d3-link-results ${visibleResults ? 'visible' : 'hidden'} `}
        ref={resultRef}
      />
    </div>
  );
};
