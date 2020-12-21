import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { Form, Pagination as BSPagination } from 'react-bootstrap';

import styled from 'styled-components';

import {
  ExperimentListQueryParameters,
  IExperiment,
  IExperimentList
} from '../API/Experiment';

import Experiment from '../Store/Experiment';

dayjs.extend(relativeTime);
dayjs().format();

const DropDownContainer = styled.div`
  flex: 2;
`;

const DropDownHeader = styled.div`
  cursor: pointer;
  color: #007ad9 !important;

  &:hover {
    color: #0056b3;
    text-decoration: underline;
  }

  &:after {
    display: inline-block;
    margin-left: 0.255em;
    vertical-align: 0.255em;
    content: '';
    border-top: 0.3em solid;
    border-right: 0.3em solid transparent;
    border-bottom: 0;
    border-left: 0.3em solid transparent;
  }
`;

const DropDownListContainer = styled.div`
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  padding: 1em 0 0 0 !important;
  position: absolute;
  z-index: 100;
`;

const DropDownList = styled.ul`
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li`
  list-style: none;
  cursor: pointer;
  padding: 4px 24px;

  &:hover {
    background-color: #007ad9;
    color: white;
  }
`;

const MessageItem = styled.li`
  list-style: none;
  cursor: pointer;
  padding: 4px 24px;
`;

const SearchContainer = styled.div`
  margin: 0 1em 8px 1em;
`;

const PaginationContainer = styled.div`
  margin-top: 8px;
  margin-bottom: 1em;
`;

interface Props {
  handleSelectExperiment: (experiment: IExperiment) => void;
}

interface InternalProps {
  list: ({ ...params }: ExperimentListQueryParameters) => Promise<void>;
}

const Pagination = ({
  ...props
}: {
  experimentList?: IExperimentList;
  list: InternalProps['list'];
}): JSX.Element => {
  const { experimentList, list } = props;

  return (
    <>
      {experimentList && experimentList.totalPages > 1 && (
        <BSPagination className="justify-content-center">
          <BSPagination.Prev
            disabled={experimentList.currentPage === 0}
            onClick={(
              e: React.MouseEvent<HTMLElement, MouseEvent>
            ): Promise<void> => {
              e.preventDefault();
              return list({
                page: experimentList.currentPage - 1
              });
            }}
          />
          {[...Array(experimentList.totalPages).keys()].map(n => (
            <BSPagination.Item
              key={`page-${n}`}
              onClick={(): Promise<void> => list({ page: n })}
              active={experimentList.currentPage === n}
            >
              {n}
            </BSPagination.Item>
          ))}
          <BSPagination.Next
            disabled={
              experimentList.totalPages === experimentList.currentPage + 1
            }
            onClick={(): Promise<void> =>
              list({
                page: experimentList.currentPage + 1
              })
            }
          />
        </BSPagination>
      )}
    </>
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
    <Form.Control
      value={searchName}
      placeholder="Search"
      onChange={(e): void => {
        setSearchName(e.target.value);
      }}
    />
  );
};

const Items = ({
  handleOnClick
}: {
  handleOnClick: (experiment: IExperiment) => void;
}): JSX.Element => {
  const Container = Experiment.useContainer();
  const experimentList = Container && Container?.experimentList;
  const list = Container && Container?.list;
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

      {!experimentList?.experiments && searchName.length > 2 && (
        <MessageItem>Your search didn&apos;t return any results</MessageItem>
      )}

      {!experimentList?.experiments && searchName.length < 3 && (
        <MessageItem>You don&apos;t have any experiment yet</MessageItem>
      )}

      {experimentList?.experiments?.map(
        (experiment: IExperiment, i: number) => (
          <ListItem
            onClick={() => handleOnClick(experiment)}
            key={experiment.uuid}
          >
            {experiment.name}
          </ListItem>
        )
      )}

      <PaginationContainer>
        <Pagination {...{ experimentList, list }} />
      </PaginationContainer>
    </>
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<IExperiment | null>(
    null
  );

  const toggling = (): void => setIsOpen(!isOpen);

  const onOptionClicked = (experiment: IExperiment): void => {
    props.handleSelectExperiment(experiment);
    setSelectedOption(experiment);
    setIsOpen(false);
  };

  return (
    <DropDownContainer>
      <DropDownHeader onClick={toggling}>
        {selectedOption?.name
          ? `from ${selectedOption?.name}`
          : 'Select from Experiment'}
      </DropDownHeader>
      {isOpen && (
        <DropDownListContainer>
          <DropDownList>
            <Experiment.Provider>
              <Items handleOnClick={onOptionClicked} />
            </Experiment.Provider>
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownContainer>
  );
};
