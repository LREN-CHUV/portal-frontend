import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { MIP } from '../../types';
import Highchart from '../Experiment/Result/formats/Highchart';
import Loading from '../UI/Loader';

export default ({
  histograms
}: {
  histograms: MIP.Store.IMiningResponseShape;

}) => (
  <div>
    {histograms && histograms.loading && <Loading />}
    {histograms && histograms.error && (
      <div className='error'>
        <h3>An error has occured</h3>
        <p>{histograms.error}</p>
      </div>
    )}
    {histograms && histograms.data && (
      <Tabs defaultActiveKey={1} id='uncontrolled-histogram-tabs'>
        {histograms.data &&
          histograms.data.map((h: any, i: number) => (
            <Tab eventKey={i} title={`${h.label.replace('Histogram - ', '')}`} key={i}>
              <Highchart options={h} />
            </Tab>
          ))}
      </Tabs>
    )}
  </div>
);
