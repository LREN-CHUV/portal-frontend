import * as React from 'react';
import { Pagination, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { IExperimentList, IExperiment } from '../API/Experiment';

const Container = styled.div`
  background-color: #fff;
`;

interface Props {
  experimentList?: IExperimentList;
}

const Experiment = ({ experiment }: { experiment: IExperiment }) => (
  <tr>
    <td>{experiment.viewed}</td>
    <td>{experiment.name}</td>
    <td>{experiment.created}</td>
    <td>{experiment.createdBy}</td>
    <td>share delete rename</td>
  </tr>
);

export default ({ experimentList }: Props) => (
  <Container>
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
  </Container>
);
