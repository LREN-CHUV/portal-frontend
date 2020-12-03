import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  title: string;
  body: string;
  handleCancel: () => void;
  handleOK: () => void;
  show: boolean;
}
const ModalComponent = ({
  show,
  title,
  body,
  handleCancel,
  handleOK
}: Props): JSX.Element => (
  <Modal show={show} onHide={handleCancel}>
    <Modal.Header translate="no">
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>

    <Modal.Body>{body}</Modal.Body>

    <Modal.Footer>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleOK}>OK</Button>
    </Modal.Footer>
  </Modal>
);

export default ModalComponent;
