import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { Container, Pagination, Table } from 'react-bootstrap';

import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  ExperimentListQueryParameters,
  IExperiment,
  IExperimentList
} from '../API/Experiment';

dayjs.extend(relativeTime);
dayjs().format();

const Wrapper = styled(Container)`
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;

  a:link,
  a:visited {
    color: blue !important;
    text-decoration: none;
  }

  table tr td {
    font-size: 1rem;
  }

  .centered {
    text-align: center;
  }

  .actions {
    width: 140px;
  }
`;

const SearchContainer = styled.div`
  margin: 1rem 0;
`;

interface Props {
  experimentList?: IExperimentList;
  handleQueryParameters: ({ ...params }: ExperimentListQueryParameters) => void;
}

const ExperimentRow = ({
  ...props
}: {
  experiment: IExperiment;
}): JSX.Element => {
  const { experiment } = props;

  return (
    <tr>
      <td className="align-middle">
        <Link to={`/experiment/${experiment.uuid}`} title={experiment.name}>
          {experiment.name}
        </Link>
      </td>
    </tr>
  );
};

const Search = ({
  handleQueryParameters,
  searchName,
  setSearchName
}: {
  handleQueryParameters: Props['handleQueryParameters'];
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element => {
  useEffect(() => {
    if (searchName.length > 2) {
      handleQueryParameters({ name: searchName });
    } else {
      handleQueryParameters({ name: '' });
    }
  }, [searchName, handleQueryParameters]);

  return (
    <input
      placeholder="Searrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrch"
      value={searchName}
      onChange={(e): void => {
        setSearchName(e.target.value);
      }}
    />
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const { experimentList, handleQueryParameters } = props;
  const [searchName, setSearchName] = useState<string>('');

  return (
    <Wrapper>
      <SearchContainer>
        <Search
          handleQueryParameters={handleQueryParameters}
          searchName={searchName}
          setSearchName={setSearchName}
        />
      </SearchContainer>
      {experimentList && experimentList?.experiments ? (
        <>
          <Table striped bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {experimentList?.experiments?.map(experiment => (
                <ExperimentRow key={experiment.uuid} experiment={experiment} />
              ))}
            </tbody>
          </Table>
          {experimentList.totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                disabled={experimentList.currentPage === 0}
                onClick={(): void =>
                  handleQueryParameters({
                    page: experimentList.currentPage - 1
                  })
                }
              />
              {[...Array(experimentList.totalPages).keys()].map(n => (
                <Pagination.Item
                  key={`page-${n}`}
                  onClick={(): void => handleQueryParameters({ page: n })}
                  active={experimentList.currentPage === n}
                >
                  {n}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={
                  experimentList.totalPages === experimentList.currentPage + 1
                }
                onClick={(): void =>
                  handleQueryParameters({
                    page: experimentList.currentPage + 1
                  })
                }
              />
            </Pagination>
          )}
        </>
      ) : searchName.length > 2 ? (
        <div>Your search didn&apos;t return any results</div>
      ) : (
        <div>You don&apos;t have any experiment yet</div>
      )}
    </Wrapper>
  );
};
