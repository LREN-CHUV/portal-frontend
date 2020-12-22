import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Container, Pagination, Table, Form } from 'react-bootstrap';
import {
  BsCloudDownload,
  BsFillExclamationCircleFill,
  BsFillEyeFill,
  BsFillEyeSlashFill,
  BsFillTrashFill,
  BsPencilSquare,
  BsWatch
} from 'react-icons/bs';
import { Link } from 'react-router-dom';

import { FaShareAlt } from 'react-icons/fa';
import { GoCheck, GoX } from 'react-icons/go';
import styled from 'styled-components';

import {
  ExperimentListQueryParameters,
  IExperiment,
  IExperimentList
} from '../API/Experiment';
import { useKeyPressed, useOnClickOutside } from '../utils';
import Modal from './Modal';

dayjs.extend(relativeTime);
dayjs().format();

const Wrapper = styled(Container)`
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  min-width: 600px;

  a:link,
  a:visited {
    color: #007ad9 !important;
  }

  .experiment-name a :hover {
    text-decoration: underline !important;
    color: #0056b3 !important;
  }

  table tr td {
    font-size: 1rem;
  }

  table th {
    font-weight: normal;
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

const DropDownContainer = styled.div`
  flex: 2;
`;

const DropDownHeader = styled.div`
  cursor: pointer;
  color: white !important;
  margin-right: 16px;

  &:hover {
    color: #ccc !important;
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

interface Props {
  username?: string;
  experimentList?: IExperimentList;
  handleDelete: (uuid: string) => void;
  handleUpdate: (uuid: string, experiment: Partial<IExperiment>) => void;
  handleQueryParameters: ({ ...params }: ExperimentListQueryParameters) => void;
  setParameterExperiment: (parameterExperiment?: IExperiment) => void;
}

interface InternalProps extends Pick<Props, 'username' | 'handleUpdate'> {
  experiment: IExperiment;
  setConfirmDelete: React.Dispatch<
    React.SetStateAction<null | { uuid: string; confirm: boolean }>
  >;
  handleOnClick: (parameterExperiment: IExperiment) => void;
}

interface EditingProps {
  editingExperimentName: null | { uuid: string; name: string };
  setEditingExperimentName: React.Dispatch<
    React.SetStateAction<null | { uuid: string; name: string }>
  >;
}

const ExperimentIcon = ({
  status,
  viewed,
  shared
}: Partial<IExperiment>): JSX.Element => {
  if (status === 'error') {
    return <BsFillExclamationCircleFill />;
  }

  if (status === 'pending') {
    return <BsWatch />;
  }

  if (shared) {
    return (
      <div style={{ color: 'blue' }}>
        <FaShareAlt />
      </div>
    );
  }

  if (viewed) {
    return <BsFillEyeFill />;
  }

  if (!viewed && status === 'success') {
    return <BsFillEyeSlashFill />;
  }

  return <BsCloudDownload />;
};

const InlineNameEdit = ({
  ...props
}: InternalProps &
  Omit<InternalProps, 'experiment'> &
  EditingProps): JSX.Element => {
  const {
    editingExperimentName,
    setEditingExperimentName,
    handleUpdate
  } = props;
  const shouldSubmit = useKeyPressed((ev: KeyboardEvent) => ev.key === 'Enter');
  const shouldCancel = useKeyPressed(
    (ev: KeyboardEvent) => ev.key === 'Escape'
  );

  const submit = useCallback(
    (uuid: string, name: string): void => {
      handleUpdate(uuid, { name });
      setEditingExperimentName(null);
    },
    [handleUpdate, setEditingExperimentName]
  );

  const cancel = useCallback((): void => {
    setEditingExperimentName(null);
  }, [setEditingExperimentName]);

  useEffect(() => {
    if (editingExperimentName) {
      if (shouldSubmit) {
        submit(editingExperimentName.uuid, editingExperimentName.name);
      }
      if (shouldCancel) {
        cancel();
      }
    }
  }, [shouldSubmit, shouldCancel, editingExperimentName, submit, cancel]);

  if (!editingExperimentName) return <p>Something went wrong</p>;

  return (
    <>
      <input
        autoFocus
        placeholder={editingExperimentName?.name}
        value={editingExperimentName?.name}
        onChange={(e): void =>
          setEditingExperimentName({
            uuid: editingExperimentName.uuid,
            name: e.target.value
          })
        }
      />
      <Button
        size={'sm'}
        variant="primary"
        onClick={(): void => {
          submit(editingExperimentName.uuid, editingExperimentName.name);
        }}
      >
        <GoCheck />
      </Button>{' '}
      <Button
        size={'sm'}
        variant="outline-dark"
        onClick={(): void => {
          cancel();
        }}
      >
        <GoX />
      </Button>
    </>
  );
};

const ExperimentRow = ({ ...props }: InternalProps): JSX.Element => {
  const { experiment, username } = props;
  const isOwner = username === experiment.createdBy;
  const [editingExperimentName, setEditingExperimentName] = useState<
    EditingProps['editingExperimentName']
  >(null);

  return (
    <tr>
      <td className="centered align-middle">
        <ExperimentIcon {...experiment} />
      </td>
      <td className="align-middle">
        {' '}
        {editingExperimentName?.uuid === experiment.uuid ? (
          <InlineNameEdit
            editingExperimentName={editingExperimentName}
            setEditingExperimentName={setEditingExperimentName}
            {...props}
          />
        ) : (
          <Link
            className="experiment-name"
            to={`/experiment/${experiment.uuid}`}
            title={experiment.name}
            onClick={(): void => props.handleOnClick(experiment)}
          >
            {experiment.name}
          </Link>
        )}
      </td>
      <td className="centered align-middle">
        {dayjs().to(dayjs(experiment.created))}
      </td>
      <td className="centered align-middle">{experiment.createdBy}</td>
      <td className="centered align-middle">
        <Button
          size={'sm'}
          disabled={!isOwner}
          variant="light"
          onClick={(): void =>
            props?.handleUpdate(experiment.uuid, { shared: !experiment.shared })
          }
        >
          <FaShareAlt />
        </Button>{' '}
        <Button
          size={'sm'}
          disabled={!isOwner || editingExperimentName?.uuid === experiment.uuid}
          variant="light"
          onClick={(): void => {
            setEditingExperimentName({
              uuid: experiment.uuid,
              name: experiment.name
            });
          }}
        >
          <BsPencilSquare />
        </Button>{' '}
        <Button
          size={'sm'}
          disabled={!isOwner}
          variant="light"
          onClick={(): void => {
            props.setConfirmDelete({ uuid: experiment.uuid, confirm: true });
          }}
        >
          <BsFillTrashFill />
        </Button>
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
      handleQueryParameters({ name: searchName, page: 0 });
    } else {
      handleQueryParameters({ name: '' });
    }
  }, [searchName, handleQueryParameters]);

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
  ...props
}: Props & { handleOnClick: InternalProps['handleOnClick'] }): JSX.Element => {
  const { experimentList, handleQueryParameters } = props;
  const [confirmDelete, setConfirmDelete] = useState<null | {
    uuid: string;
    confirm: boolean;
  }>(null);
  const [searchName, setSearchName] = useState<string>('');

  return (
    <Wrapper>
      <Modal
        show={confirmDelete !== null}
        title={'Delete'}
        body={'Really delete this experiment ?'}
        handleCancel={(): void => setConfirmDelete(null)}
        handleOK={(): void => {
          if (confirmDelete?.uuid) {
            props.handleDelete(confirmDelete.uuid);
            setConfirmDelete(null);
          }
        }}
      />
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
                <th></th>
                <th>Name</th>
                <th>Created</th>
                <th>Created By</th>
                <th className="actions"></th>
              </tr>
            </thead>
            <tbody>
              {experimentList?.experiments?.map(experiment => (
                <ExperimentRow
                  key={experiment.uuid}
                  experiment={experiment}
                  username={props.username}
                  handleUpdate={props.handleUpdate}
                  setConfirmDelete={setConfirmDelete}
                  handleOnClick={handleOnClick}
                />
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

const Dropdown = ({ ...props }: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const node = useRef(null);

  const toggling = (): void => setIsOpen(!isOpen);

  const onOptionClicked = (experiment?: IExperiment): void => {
    props.setParameterExperiment(experiment);
    setIsOpen(false);
  };

  const handleClickOutside = (event: Event): void => {
    setIsOpen(false);
  };

  useOnClickOutside(node, handleClickOutside);

  return (
    <DropDownContainer ref={node}>
      <DropDownHeader onClick={toggling}>My Experiments</DropDownHeader>
      {isOpen && (
        <DropDownListContainer>
          <Items handleOnClick={onOptionClicked} {...props} />
        </DropDownListContainer>
      )}
    </DropDownContainer>
  );
};

export default ({ ...props }: Props): JSX.Element => <Dropdown {...props} />;
