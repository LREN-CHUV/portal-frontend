import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

const Layout = styled.div`
  padding: 0 48px 0px 48px;
`;

const Submit = styled.div`
  text-align: right;
`;

export default () => (
  <Layout>
    <Panel>
      <Panel.Body>
        <div className='form-group'>
          <label className='control-label'>Title</label>
          <input className='form-control' type='text' name='title' />
        </div>
        <div className='form-group'>
          <label className='control-label'>Abstract</label>
          <textarea className='form-control' name='abstract' />
        </div>
        <div className='form-group'>
          <label className='control-label'>Content</label>
          <textarea className='form-control' name='content' />
        </div>
        <Submit>
          <button className='btn-primary btn' disabled={true}>
            Save
          </button>
          <button className='btn-default btn' disabled={true}>
            Reset
          </button>
        </Submit>
      </Panel.Body>
    </Panel>
  </Layout>
);
