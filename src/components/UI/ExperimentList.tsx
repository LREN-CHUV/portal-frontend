import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as React from 'react';
import { Button, Container, Pagination, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { IExperiment, IExperimentList } from '../API/Experiment';
import {
  BsFillExclamationCircleFill,
  BsFillEyeFill,
  BsFillEyeSlashFill,
  BsCloudDownload,
  BsFillTrashFill,
  BsPencilSquare,
  BsBoxArrowUp
} from 'react-icons/bs';
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
  experimentList?: IExperimentList;
  handleDelete: (uuid: string) => void;
  handleToggleShare: (uuid: string, experiment: Partial<IExperiment>) => void;
  handleSelect: (uuid: string) => void;
  handlePage: (page: number) => void;
}

const ExperimentIcon = ({ experiment }: { experiment: IExperiment }): JSX.Element => {
  if (experiment.status === 'error') {
    return <BsFillExclamationCircleFill />;
  }

  if (experiment.shared) {
    return (
      <div style={{ color: 'blue' }}>
        <BsBoxArrowUp size={24} />
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

const ExperimentRow = ({ ...props }: Props & { experiment: IExperiment }): JSX.Element => {
  const e = props.experiment;
  return (
    <tr>
      <td>
        <ExperimentIcon experiment={e} />
      </td>
      <td>{e.name}</td>
      <td>{dayjs().to(dayjs(e.created))}</td>
      <td>{e.createdBy}</td>
      <td>
        <Button onClick={(): void => props?.handleToggleShare(e.uuid, e)}>
          <BsBoxArrowUp />
        </Button>
        <Button onClick={(): void => props?.handleDelete(e.uuid)}>
          <BsFillTrashFill />
        </Button>
        <BsPencilSquare />
      </td>
    </tr>
  );
};

export default ({ ...props }: Props): JSX.Element => {
  const { experimentList, handlePage } = props;

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
