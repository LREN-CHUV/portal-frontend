import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
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
  background-color: #fff;
  min-width: 600px;
  a:link,
  a:visited {
    color: blue;
    text-decoration: none;
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
  extends Pick<
    Props,
    'username' | 'handleDelete' | 'handleToggleShare' | 'handleUpdateName'
  > {
  experiment: IExperiment;
  editingName: null | { uuid: string; name: string };
  setEditingName: React.Dispatch<
    React.SetStateAction<null | { uuid: string; name: string }>
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
  const { editingName, setEditingName, handleUpdateName } = props;
  const shouldSubmit = useKeyPressed((ev: KeyboardEvent) => ev.key === 'Enter');
  const shouldCancel = useKeyPressed(
    (ev: KeyboardEvent) => ev.key === 'Escape'
  );

  useEffect(() => {
    if (editingName) {
      if (shouldSubmit) {
        handleUpdateName(editingName.uuid, editingName.name);
        setEditingName(null);
      }
      if (shouldCancel) {
        setEditingName(null);
      }
    }
  }, [
    shouldSubmit,
    shouldCancel,
    editingName,
    setEditingName,
    handleUpdateName
  ]);

  if (!editingName) return <p>Something went wrong</p>;

  return (
    <input
      placeholder={editingName?.name}
      value={editingName?.name}
      onChange={(e): void =>
        setEditingName({ uuid: editingName.uuid, name: e.target.value })
      }
    />
  );
};

const ExperimentRow = ({ ...props }: InternalProps): JSX.Element => {
  const { experiment, username, editingName, setEditingName } = props;
  const isOwner = username === experiment.createdBy;
  return (
    <tr>
      <td>
        <ExperimentIcon experiment={experiment} />
      </td>
      <td>
        {' '}
        {editingName?.uuid === experiment.uuid ? (
          <InlineNameEdit {...props} />
        ) : (
          <Link to={`/experiment/${experiment.uuid}`}>{experiment.name}</Link>
        )}
      </td>
      <td>{dayjs().to(dayjs(experiment.created))}</td>
      <td>{experiment.createdBy}</td>
      <td>
        <Button
          size={'sm'}
          disabled={!isOwner}
          onClick={(): void =>
            props?.handleToggleShare(experiment.uuid, experiment)
          }
        >
          <FaShareAlt />
        </Button>{' '}
        <Button
          size={'sm'}
          disabled={!isOwner}
          onClick={(): void => props?.handleDelete(experiment.uuid)}
        >
          <BsFillTrashFill />
        </Button>{' '}
        <Button
          size={'sm'}
          disabled={!isOwner}
          onClick={(): void => {
            setEditingName({ uuid: experiment.uuid, name: experiment.name });
          }}
        >
          <BsPencilSquare />
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
      placeholder="Seaaarch"
      value={searchName}
      onChange={(e): void => {
        setSearchName(e.target.value);
      }}
    />
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const { experimentList, handleQueryParameters } = props;
  const [editingName, setEditingName] = useState<InternalProps['editingName']>(
    null
  );

  return (
    <Wrapper>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experimentList?.experiments?.map(experiment => (
                <ExperimentRow
                  key={experiment.uuid}
                  experiment={experiment}
                  editingName={editingName}
                  setEditingName={setEditingName}
                  username={props.username}
                  handleDelete={props.handleDelete}
                  handleToggleShare={props.handleToggleShare}
                  handleUpdateName={props.handleUpdateName}
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
