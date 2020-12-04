import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState } from 'react';
import { Button, Container, Pagination, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { IExperiment, IExperimentList } from '../API/Experiment';
import {
  BsFillExclamationCircleFill,
  BsFillEyeFill,
  BsFillEyeSlashFill,
  BsCloudDownload,
  BsFillTrashFill,
  BsPencilSquare
} from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { FaShareAlt } from 'react-icons/fa';
dayjs.extend(relativeTime);
dayjs().format();

const Wrapper = styled(Container)`
  background-color: #fff;
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

const ExperimentRow = ({
  ...props
}: Props & {
  experiment: IExperiment;
  editing: string;
  setEditing: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element => {
  const { experiment, username, editing, setEditing } = props;
  const isOwner = username === experiment.createdBy;
  return (
    <tr>
      <td>
        <ExperimentIcon experiment={experiment} />
      </td>
      <td>
        {' '}
        {editing === experiment.uuid ? (
          <input placeholder={experiment.name} />
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
          onClick={(): void => setEditing(experiment.uuid)}
        >
          <BsPencilSquare />
        </Button>
      </td>
    </tr>
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const { experimentList, handlePage } = props;
  const [editing, setEditing] = useState('uuid');

  return experimentList ? (
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
    <div>No experiment yet</div>
  );
};
