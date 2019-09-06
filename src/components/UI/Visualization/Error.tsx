import React from 'react';

export default ({ message }: { message: any }) => (
  <div className="error">
    <h3>An error has occured</h3>
    <p>{message}</p>
  </div>
);
