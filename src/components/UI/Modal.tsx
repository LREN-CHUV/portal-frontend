import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  title: string;
  body: string;
  handleCancel: () => void;
  handleOK: () => void;
}
const ModalComponent = ({ title, body, handleCancel, handleOK }: Props) => (
  <div className="static-modal">
    <Modal.Dialog>
      <Modal.Header translate="no">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{body}</Modal.Body>

      <Modal.Footer>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleOK}>OK</Button>
      </Modal.Footer>
    </Modal.Dialog>
  </div>
);

export default ModalComponent;
