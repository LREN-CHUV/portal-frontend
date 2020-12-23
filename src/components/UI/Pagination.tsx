import React from 'react';
import { Pagination } from 'react-bootstrap';
import { IExperimentList, HandleQueryParameters } from '../API/Experiment';

export default ({
  list,
  query
}: {
  list: IExperimentList;
  query: HandleQueryParameters;
}): JSX.Element => {
  const isSmallList = list.totalPages < 10;
  const firstNumbers = [...Array(Math.abs(list.currentPage - 5)).keys()];
  const lastNumbers = [...Array(Math.abs(list.currentPage + 5)).keys()];

  return (
    <Pagination className="justify-content-center">
      {!isSmallList && <Pagination.First />}
      <Pagination.Prev
        disabled={list.currentPage === 0}
        onClick={(): void =>
          query({
            page: list.currentPage - 1
          })
        }
      />

      {isSmallList ? (
        [...Array(list.totalPages).keys()].map(n => (
          <Pagination.Item
            key={`page-${n}`}
            onClick={(): void => query({ page: n })}
            active={list.currentPage === n}
          >
            {n}
          </Pagination.Item>
        ))
      ) : (
        <>
          {firstNumbers.map(n => (
            <Pagination.Item
              key={`page-${n}`}
              onClick={(): void => query({ page: n })}
              active={list.currentPage === n}
            >
              {n}
            </Pagination.Item>
          ))}
          <Pagination.Ellipsis />
          {lastNumbers.map(n => (
            <Pagination.Item
              key={`page-${n}`}
              onClick={(): void => query({ page: n })}
              active={list.currentPage === n}
            >
              {n}
            </Pagination.Item>
          ))}
        </>
      )}
      <Pagination.Next
        disabled={list.totalPages === list.currentPage + 1}
        onClick={(): void =>
          query({
            page: list.currentPage + 1
          })
        }
      />
      {!isSmallList && <Pagination.Last />}
    </Pagination>
  );
};
