import _Modal, { ModalProps } from './modal';
import show from './show';

export type { ModalProps };

type IModal = typeof _Modal & {
  show(config: ModalProps): {
    close(): void;
  };
};

const Modal: IModal = _Modal as IModal;

Modal.show = show;

export default Modal;
