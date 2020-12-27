import { encode } from 'querystring';
import React from 'react';
import { Pagination } from 'react-bootstrap';
import { menuListCSS } from 'react-select/src/components/Menu';

import { HandleQueryParameters, IExperimentList } from '../API/Experiment';

const range = (start: number, end: number): number[] => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

export default ({
  list,
  query
}: {
  list: IExperimentList;
  query: HandleQueryParameters;
}): JSX.Element => {
  const nbOFdisplayedItem = 7;
  const median = 4;

  const start =
    list.currentPage + 1 <= median
      ? 2
      : list.currentPage + 1 >= list.totalPages - median
      ? list.totalPages - nbOFdisplayedItem
      : list.currentPage + 2 - median;
  const end = start + nbOFdisplayedItem;

  return (
    <Pagination className="justify-content-center">
      <Pagination.Prev
        disabled={list.currentPage <= 0}
        onClick={(): void =>
          query({
            page: list.currentPage - 1
          })
        }
      />

      {/* First page: 1 */}
      <Pagination.Item
        key={`page-0`}
        onClick={(): void => query({ page: 0 })}
        active={list.currentPage === 0}
      >
        1
      </Pagination.Item>

      {start + 1 >= median && <Pagination.Ellipsis disabled />}

      {range(start, end).map(n => (
        <Pagination.Item
          key={`page-${n}`}
          onClick={(): void => query({ page: n - 1 })}
          active={list.currentPage === n - 1}
        >
          {n}
        </Pagination.Item>
      ))}

      {start + nbOFdisplayedItem < list.totalPages && (
        <Pagination.Ellipsis disabled />
      )}

      {/* Last page: list.totalPages */}
      <Pagination.Item
        key={`page-${list.totalPages}`}
        onClick={(): void => query({ page: list.totalPages - 1 })}
        active={list.totalPages === list.currentPage + 1}
        disabled={list.currentPage + 1 >= list.totalPages}
      >
        {list.totalPages}
      </Pagination.Item>

      <Pagination.Next
        onClick={(): void =>
          query({
            page: list.currentPage + 1
          })
        }
        active={list.totalPages === list.currentPage + 1}
        disabled={list.currentPage + 1 >= list.totalPages}
      />
    </Pagination>
  );
};
