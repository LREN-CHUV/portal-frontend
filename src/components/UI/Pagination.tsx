import React from 'react';
import { Pagination } from 'react-bootstrap';

import { HandleQueryParameters, IExperimentList } from '../API/Experiment';

const PAGE_SIZE = 10; //pageSize (optional) - the number of items per page, defaults to 10
const MAX_PAGES = 7; // maxPages (optional) - the maximum number of page navigation links to display, defaults to 10

// https://jasonwatmore.com/post/2018/08/07/javascript-pure-pagination-logic-in-vanilla-js-typescript

const paginate = (
  totalItems: number,
  currentPage = 1,
  pageSize = 10,
  maxPages = 10
): {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  startIndex: number;
  endIndex: number;
  pages: number[];
} => {
  // calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // ensure current page isn't out of range
  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  let startPage: number, endPage: number;
  if (totalPages <= maxPages) {
    // total pages less than max so show all pages
    startPage = 1;
    endPage = totalPages;
  } else {
    // total pages more than max so calculate start and end pages
    const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // current page near the start
      startPage = 1;
      endPage = maxPages;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // current page near the end
      startPage = totalPages - maxPages + 1;
      endPage = totalPages;
    } else {
      // current page somewhere in the middle
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  // calculate start and end item indexes
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // create an array of pages to ng-repeat in the pager control
  const pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
    i => startPage + i
  );

  // return object with all pager properties required by the view
  return {
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    startPage,
    endPage,
    startIndex,
    endIndex,
    pages
  };
};

export default ({
  list,
  query
}: {
  list: IExperimentList;
  query: HandleQueryParameters;
}): JSX.Element => {
  const pagination = paginate(
    list.totalExperiments,
    list.currentPage + 1,
    PAGE_SIZE,
    MAX_PAGES
  );

  return (
    <Pagination className="justify-content-center">
      <Pagination.Prev
        disabled={pagination.currentPage <= 1}
        onClick={(): void =>
          query({
            page: pagination.currentPage - 2
          })
        }
      />

      {pagination.pages.map((n: number) => (
        <Pagination.Item
          key={`page-${n}`}
          onClick={(): void => query({ page: n - 1 })}
          active={pagination.currentPage === n}
        >
          {n}
        </Pagination.Item>
      ))}

      <Pagination.Next
        onClick={(): void =>
          query({
            page: pagination.currentPage
          })
        }
        active={pagination.totalPages === pagination.currentPage}
        disabled={pagination.currentPage >= pagination.totalPages}
      />
    </Pagination>
  );
};
