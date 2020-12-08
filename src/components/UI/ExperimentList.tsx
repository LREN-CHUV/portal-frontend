import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container, Pagination, Table } from 'react-bootstrap';
import {
  BsCloudDownload,
  BsFillExclamationCircleFill,
  BsFillEyeFill,
  BsFillEyeSlashFill,
  BsFillTrashFill,
  BsPencilSquare
} from 'react-icons/bs';
import { FaShareAlt } from 'react-icons/fa';
import { GoCheck, GoX } from 'react-icons/go';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  ExperimentListQueryParameters,
  IExperiment,
  IExperimentList
} from '../API/Experiment';
import { useKeyPressed } from '../utils';
import Modal from './Modal';

dayjs.extend(relativeTime);
dayjs().format();

const Wrapper = styled(Container)`
  background-color: #fff;
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
    min-width: 140px;
  }
`;

interface Props {
  username?: string;
  experimentList?: IExperimentList;
  handleDelete: (uuid: string) => void;
  handleUpdate: (uuid: string, experiment: Partial<IExperiment>) => void;
  handleQueryParameters: ({ ...params }: ExperimentListQueryParameters) => void;
}

interface InternalProps extends Pick<Props, 'username' | 'handleUpdate'> {
  experiment: IExperiment;
  setConfirmDelete: React.Dispatch<
    React.SetStateAction<null | { uuid: string; confirm: boolean }>
  >;
}
interface EditingProps {
  editingExperimentName: null | { uuid: string; name: string };
  setEditingExperimentName: React.Dispatch<
    React.SetStateAction<null | { uuid: string; name: string }>
  >;
}

const ExperimentIcon = ({
  experiment
}: {
  experiment: IExperiment;
}): JSX.Element => {
  if (experiment.status === 'error') {
    return <BsFillExclamationCircleFill />;
  }

  if (experiment.shared) {
    return (
      <div style={{ color: 'blue' }}>
        <FaShareAlt />
      </div>
    );
  }

  if (experiment.viewed) {
    return <BsFillEyeFill />;
  }

  if (!experiment.viewed && experiment.status === 'success') {
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
      <td className="centered">
        <ExperimentIcon experiment={experiment} />
      </td>
      <td>
        {' '}
        {editingExperimentName?.uuid === experiment.uuid ? (
          <InlineNameEdit
            editingExperimentName={editingExperimentName}
            setEditingExperimentName={setEditingExperimentName}
            {...props}
          />
        ) : (
          <Link to={`/experiment/${experiment.uuid}`} title={experiment.name}>
            {experiment.name}
          </Link>
        )}
      </td>
      <td className="centered">{dayjs().to(dayjs(experiment.created))}</td>
      <td className="centered">{experiment.createdBy}</td>
      <td className="centered">
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
      handleQueryParameters({ name: searchName });
    } else {
      handleQueryParameters({ name: '' });
    }
  }, [searchName, handleQueryParameters]);

  return (
    <input
      placeholder="Searrrrrrrrrrrrrch"
      value={searchName}
      onChange={(e): void => {
        setSearchName(e.target.value);
      }}
    />
  );
};

export default ({ ...props }: Props): JSX.Element => {
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
        title={'Delete this experiment ?'}
        body={'This will be final'}
        handleCancel={(): void => setConfirmDelete(null)}
        handleOK={(): void => {
          if (confirmDelete?.uuid) {
            props.handleDelete(confirmDelete.uuid);
            setConfirmDelete(null);
          }
        }}
      />
      <div>
        <Search
          handleQueryParameters={handleQueryParameters}
          searchName={searchName}
          setSearchName={setSearchName}
        />
      </div>
      {experimentList && experimentList?.experiments ? (
        <>
          <Table striped bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Created</th>
                <th>Created By</th>
                <th className="actions">Actions</th>
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
                />
              ))}
            </tbody>
          </Table>
          {experimentList.totalPages > 1 && (
            <Pagination>
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
