import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Home from './Home';

const Layout = styled.div`
    padding: 0 48px 0px 48px;
`

export default () => <Layout><Home /></Layout>