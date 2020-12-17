import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { Button, Container, Pagination, Card } from 'react-bootstrap';

import styled from 'styled-components';

import {
  ExperimentListQueryParameters,
  IExperiment,
  IExperimentList
} from '../API/Experiment';

import Experiment from '../Store/Experiment';

dayjs.extend(relativeTime);
dayjs().format();

const Wrapper = styled(Container)`
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;

  a:link,
  a:visited {
    color: #007ad9 !important;
    text-decoration: none;
  }

  .btn {
    display: block;
  }
`;

const SearchContainer = styled.div`
  margin: 1rem 0;
`;

interface Props {
  handleSelectExperiment: (experiment: IExperiment) => void;
}

interface InternalProps {
  list: ({ ...params }: ExperimentListQueryParameters) => Promise<void>;
}

const ExperimentTable = ({
  ...props
}: {
  experimentList?: IExperimentList;
  searchName: string;
  handleSelectExperiment: (experiment: IExperiment) => void;
  list: InternalProps['list'];
}): JSX.Element => {
  const { experimentList, searchName, handleSelectExperiment, list } = props;

  return experimentList && experimentList?.experiments ? (
    <>
      <Card>
        {experimentList?.experiments?.map((experiment: IExperiment) => (
          <Button
            key={experiment.uuid}
            onClick={(): void => handleSelectExperiment(experiment)}
            variant={'link'}
          >
            {experiment.name}
          </Button>
        ))}
      </Card>
      {experimentList.totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={experimentList.currentPage === 0}
            onClick={(): Promise<void> =>
              list({
                page: experimentList.currentPage - 1
              })
            }
          />
          {[...Array(experimentList.totalPages).keys()].map(n => (
            <Pagination.Item
              key={`page-${n}`}
              onClick={(): Promise<void> => list({ page: n })}
              active={experimentList.currentPage === n}
            >
              {n}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={
              experimentList.totalPages === experimentList.currentPage + 1
            }
            onClick={(): Promise<void> =>
              list({
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
  );
};

const Search = ({
  list,
  searchName,
  setSearchName
}: {
  list: InternalProps['list'];
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element => {
  useEffect(() => {
    if (searchName.length > 2) {
      list({ name: searchName });
    } else {
      list({ name: '' });
    }
  }, [searchName, list]);

  return (
    <input
      placeholder="Search"
      value={searchName}
      onChange={(e): void => {
        setSearchName(e.target.value);
      }}
    />
  );
};

const Main = ({ handleSelectExperiment }: Props): JSX.Element => {
  const experiment = Experiment.useContainer();
  const { list } = experiment;
  const [searchName, setSearchName] = useState<string>('');

  return (
    <>
      <SearchContainer>
        <Search
          list={list}
          searchName={searchName}
          setSearchName={setSearchName}
        />
      </SearchContainer>

      <ExperimentTable
        experimentList={experiment.experimentList}
        searchName={searchName}
        handleSelectExperiment={handleSelectExperiment}
        list={list}
      />
    </>
  );
};

export default ({ ...props }: Props): JSX.Element => {
  return (
    <Experiment.Provider>
      <Wrapper>
        <Main handleSelectExperiment={props.handleSelectExperiment} />
      </Wrapper>
    </Experiment.Provider>
  );
};
