import React from 'react';
import Button from '../button';
import './index.less';

interface ModalProps {
  visible: boolean;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ visible, title = '', children }) => {
  return visible ? (
    <div className='muse-modal'>
      <div className='muse-modal-mask' />
      <div className='muse-modal-content'>
        <div className='muse-modal-main'>
          <div className='muse-modal-title'>{title}</div>
          <div className='muse-modal-body'>{children}</div>
          <div className='muse-title-footer'>
            <Button type='primary'>取消</Button>
            <Button type='dashed'>取消</Button>
            <Button type='text'>取消</Button>
            <Button type='danger'>取消</Button>
            <Button type='danger' disable>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Modal;
