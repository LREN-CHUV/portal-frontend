import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState, useCallback } from 'react';
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
import Modal from './Modal';

dayjs.extend(relativeTime);
dayjs().format();

const Wrapper = styled(Container)`
  background-color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  min-width: 600px;
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
  handleToggleShare: (uuid: string, experiment: Partial<IExperiment>) => void;
  handleQueryParameters: ({ ...params }: ExperimentListQueryParameters) => void;
  handleUpdateName: (uuid: string, name: string) => void;
}

interface InternalProps
  extends Pick<Props, 'username' | 'handleToggleShare' | 'handleUpdateName'> {
  experiment: IExperiment;
  editingExperimentName: null | { uuid: string; name: string };
  setEditingExperimentName: React.Dispatch<
    React.SetStateAction<null | { uuid: string; name: string }>
  >;
  //confirmDelete: null | { uuid: string; confirm: boolean };
  setConfirmDelete: React.Dispatch<
    React.SetStateAction<null | { uuid: string; confirm: boolean }>
  >;
}
/**
 * useKeyPress
 * @param {string} key - the name of the key to respond to, compared against event.key
 * @param {function} action - the action to perform on key press
 */

export function useKeyPressed(
  keyLookup: (event: KeyboardEvent) => boolean
): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (ev: KeyboardEvent): void =>
      setKeyPressed(keyLookup(ev));
    const upHandler = (ev: KeyboardEvent): void => setKeyPressed(keyLookup(ev));

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return (): void => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [keyLookup]);

  return keyPressed;
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
}: InternalProps & Omit<InternalProps, 'experiment'>): JSX.Element => {
  const {
    editingExperimentName,
    setEditingExperimentName,
    handleUpdateName
  } = props;
  const shouldSubmit = useKeyPressed((ev: KeyboardEvent) => ev.key === 'Enter');
  const shouldCancel = useKeyPressed(
    (ev: KeyboardEvent) => ev.key === 'Escape'
  );

  const submit = useCallback(
    (uuid: string, name: string): void => {
      handleUpdateName(uuid, name);
      setEditingExperimentName(null);
    },
    [handleUpdateName, setEditingExperimentName]
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
  const {
    experiment,
    username,
    editingExperimentName,
    setEditingExperimentName
  } = props;
  const isOwner = username === experiment.createdBy;

  return (
    <tr>
      <td className="centered">
        <ExperimentIcon experiment={experiment} />
      </td>
      <td>
        {' '}
        {editingExperimentName?.uuid === experiment.uuid ? (
          <InlineNameEdit {...props} />
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
            props?.handleToggleShare(experiment.uuid, experiment)
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
  handleQueryParameters
}: {
  handleQueryParameters: Props['handleQueryParameters'];
}): JSX.Element => {
  const [searchName, setSearchName] = useState<string>('');

  useEffect(() => {
    if (searchName.length > 2) {
      handleQueryParameters({ name: searchName });
    } else {
      handleQueryParameters({ name: '' });
    }
  }, [searchName, handleQueryParameters]);

  return (
    <input
      placeholder="Seaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaarch"
      value={searchName}
      onChange={(e): void => {
        setSearchName(e.target.value);
      }}
    />
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const { experimentList, handleQueryParameters } = props;
  const [editingExperimentName, setEditingExperimentName] = useState<
    InternalProps['editingExperimentName']
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<null | {
    uuid: string;
    confirm: boolean;
  }>(null);

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
        <Search handleQueryParameters={handleQueryParameters} />
      </div>
      {experimentList && experimentList?.experiments ? (
        <>
          <Table striped bordered hover>
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
                  editingExperimentName={editingExperimentName}
                  setEditingExperimentName={setEditingExperimentName}
                  username={props.username}
                  handleToggleShare={props.handleToggleShare}
                  handleUpdateName={props.handleUpdateName}
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
      ) : (
        <div>You don&apos;t have any experiment yet</div>
      )}
    </Wrapper>
  );
};
