import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as React from 'react';
import { Container, Pagination, Table } from 'react-bootstrap';
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
`;

interface Props {
  experimentList?: IExperimentList;
}

const ExperimentIcon = ({ experiment }: { experiment: IExperiment }) => {
  if (experiment.status === 'error') {
    return <BsFillExclamationCircleFill />;
  }

  if (experiment.viewed) {
    return <BsFillEyeFill />;
  }

  if (!experiment.viewed && experiment.status === 'succes') {
    return <BsFillEyeSlashFill />;
  }

  return <BsCloudDownload />;
};

const Experiment = ({ experiment }: { experiment: IExperiment }) => (
  <tr>
    <td>
      <ExperimentIcon experiment={experiment} />
    </td>
    <td>{experiment.name}</td>
    <td>{dayjs().to(dayjs(experiment.created))}</td>
    <td>{experiment.createdBy}</td>
    <td>
      <BsBoxArrowUp /> <BsFillTrashFill /> <BsPencilSquare />
    </td>
  </tr>
);

export default ({ experimentList }: Props) => (
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
          <Experiment experiment={experiment} />
        ))}
      </tbody>
    </Table>
    <Pagination>
      <Pagination.Prev />
      <Pagination.Item active>{1}</Pagination.Item>
      <Pagination.Ellipsis />
      <Pagination.Next />
    </Pagination>
  </Wrapper>
);
