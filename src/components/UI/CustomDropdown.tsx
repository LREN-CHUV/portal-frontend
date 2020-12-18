import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

const Menu = styled.div<ShowMenu>`
  ${(prop): string =>
    `
        display: ${prop.show ? 'default' : 'none'};
    `}
`;

interface Props {
  children: JSX.Element;
  title: string;
}

interface ShowMenu {
  show: any;
}

export default ({ children, title }: Props): JSX.Element => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const toggle = (): void => {
      setShow(!show);
    };

    window.addEventListener('click', toggle, false);

    return (): void => {
      window.removeEventListener('click', toggle);
    };
  }, [show, setShow]);

  return (
    <>
      <Button variant="link" onClick={(): void => setShow(!show)}>
        {title}
      </Button>
      <Menu show={show}>{children}</Menu>
    </>
  );
};
