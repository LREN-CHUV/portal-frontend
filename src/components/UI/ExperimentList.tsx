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

import { IExperiment, IExperimentList } from '../API/Experiment';

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
  handlePage: (page: number) => void;
  handleUpdateName: (uuid: string, name: string) => void;
}

interface InternalProps extends Props {
  experiment: IExperiment;
  editing: null | string;
  setEditing: React.Dispatch<React.SetStateAction<null | string>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
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

const InlineEdit = ({ ...props }: InternalProps): JSX.Element => {
  const {
    experiment,
    editing,
    setEditing,
    inputValue,
    setInputValue,
    handleUpdateName
  } = props;
  const shouldSubmit = useKeyPressed((ev: KeyboardEvent) => ev.key === 'Enter');
  const shouldCancel = useKeyPressed(
    (ev: KeyboardEvent) => ev.key === 'Escape'
  );

  useEffect(() => {
    if (editing) {
      if (shouldSubmit) {
        handleUpdateName(experiment.uuid, inputValue);
        setInputValue('');
        setEditing(null);
      }
      if (shouldCancel) {
        setInputValue('');
        setEditing(null);
      }
    }
  }, [
    shouldSubmit,
    shouldCancel,
    inputValue,
    setInputValue,
    editing,
    setEditing,
    experiment.uuid,
    handleUpdateName
  ]);

  return (
    <input
      placeholder={experiment.name}
      value={inputValue}
      onChange={(e): void => setInputValue(e.target.value)}
    />
  );
};

const ExperimentRow = ({ ...props }: Props & InternalProps): JSX.Element => {
  const { experiment, username, editing, setEditing, setInputValue } = props;
  const isOwner = username === experiment.createdBy;
  return (
    <tr>
      <td>
        <ExperimentIcon experiment={experiment} />
      </td>
      <td>
        {' '}
        {editing === experiment.uuid ? (
          <InlineEdit {...props} />
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
            setInputValue(experiment.name);
            setEditing(experiment.uuid);
          }}
        >
          <BsPencilSquare />
        </Button>
      </td>
    </tr>
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const { experimentList, handlePage } = props;
  const [editing, setEditing] = useState<null | string>(null);
  const [inputValue, setInputValue] = useState('');

  return experimentList && experimentList?.experiments ? (
    <Wrapper>
      <input placeholder="Search" />
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
              editing={editing}
              setEditing={setEditing}
              inputValue={inputValue}
              setInputValue={setInputValue}
              {...props}
            />
          ))}
        </tbody>
      </Table>
      {experimentList.totalPages > 1 && (
        <Pagination>
          <Pagination.Prev
            disabled={experimentList.currentPage === 0}
            onClick={(): void => handlePage(experimentList.currentPage - 1)}
          />
          {[...Array(experimentList.totalPages).keys()].map(n => (
            <Pagination.Item
              key={`page-${n}`}
              onClick={(): void => handlePage(n)}
              active={experimentList.currentPage === n}
            >
              {n}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={
              experimentList.totalPages === experimentList.currentPage + 1
            }
            onClick={(): void => handlePage(experimentList.currentPage + 1)}
          />
        </Pagination>
      )}
    </Wrapper>
  ) : (
    <Wrapper>
      <div>You don&apos;t have any experiment yet</div>
    </Wrapper>
  );
};
