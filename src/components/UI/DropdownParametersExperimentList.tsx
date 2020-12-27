import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useOnClickOutside } from '../utils';
import { Form } from 'react-bootstrap';

import { APIExperiment } from '../API';
import {
  ExperimentListQueryParameters,
  IExperiment,
  IExperimentList
} from '../API/Experiment';
import Pagination from '../UI/Pagination';

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
  background-color: #fefefe;
  border: 2px solid #eee;
  border-radius: 0.25rem;
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

const ResetItem = styled.p`
  font-size: 1em;
  cursor: pointer;
  padding: 4px 24px;
  color: #666;
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  svg {
    margin-right: 8px;
  }

  &:hover {
    background-color: #ffc107;
    color: white;
  }
`;

const MessageItem = styled.li`
  list-style: none;
  cursor: pointer;
  padding: 4px 24px;
  margin: 0 0 8px 0;
`;

const SearchContainer = styled.div`
  margin: 1em 1em 8px 1em;
`;

const PaginationContainer = styled.div`
  margin-top: 8px;
  margin-bottom: 1em;
`;

interface Props {
  apiExperiment: APIExperiment;
  handleSelectExperiment: (experiment?: IExperiment) => void;
}

interface InternalProps {
  list: ({ ...params }: ExperimentListQueryParameters) => Promise<void>;
}

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
  handleOnClick,
  experimentList,
  list
}: {
  experimentList?: IExperimentList;
  list: ({ ...params }: ExperimentListQueryParameters) => Promise<void>;
  handleOnClick: (experiment?: IExperiment) => void;
}): JSX.Element => {
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
      <DropDownList>
        {experimentList?.experiments?.map(
          (experiment: IExperiment, i: number) => (
            <ListItem
              onClick={(): void => handleOnClick(experiment)}
              key={experiment.uuid}
            >
              {experiment.name}
            </ListItem>
          )
        )}
      </DropDownList>

      {experimentList && (
        <PaginationContainer>
          <Pagination list={experimentList} query={list} />
        </PaginationContainer>
      )}

      <ResetItem onClick={(): void => handleOnClick()} key={'reset'}>
        Reset Current Parameters
      </ResetItem>
    </>
  );
};

const Dropdown = ({ ...props }: Props): JSX.Element => {
  const { apiExperiment } = props;
  const {
    state,
    parameterList: list,
    setParameterExperiment: setExperiment
  } = apiExperiment;
  const {
    parameterExperiment: e,
    parameterExperimentList: experimentList
  } = state;

  const experiment = apiExperiment.isExperiment(e);

  const [isOpen, setIsOpen] = useState(false);
  const node = useRef(null);

  const toggling = (): void => setIsOpen(!isOpen);

  const onOptionClicked = (experiment?: IExperiment): void => {
    props.handleSelectExperiment(experiment);
    setExperiment(experiment);
    setIsOpen(false);
  };

  const handleClickOutside = (event: Event): void => {
    setIsOpen(false);
  };

  useOnClickOutside(node, handleClickOutside);

  return (
    <DropDownContainer ref={node}>
      <DropDownHeader onClick={toggling}>
        {experiment ? `from ${experiment.name}` : 'Select from Experiment'}
      </DropDownHeader>
      {isOpen && (
        <DropDownListContainer>
          <Items
            handleOnClick={onOptionClicked}
            {...{ experimentList, list }}
          />
        </DropDownListContainer>
      )}
    </DropDownContainer>
  );
};

export default ({ ...props }: Props): JSX.Element => <Dropdown {...props} />;
