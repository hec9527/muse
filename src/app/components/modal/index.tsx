import React from 'react';
import Button, { ButtonProps } from '../button';
import './index.less';

interface ModalProps {
  visible: boolean;
  title?: string;
  okButtonType?: ButtonProps['type'];
  okButtonText?: string;
  cancelButtonType?: ButtonProps['type'];
  cancelButtonText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  extButtons?: React.ReactFragment;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  title = '确认发布',
  onOk,
  onCancel,
  children,
  extButtons,
  okButtonText = '确定',
  okButtonType = 'primary',
  cancelButtonText = '取消',
  cancelButtonType = 'text',
}) => {
  return visible ? (
    <div className='muse-modal'>
      <div className='muse-modal-mask' />
      <div className='muse-modal-content'>
        <div className='muse-modal-main'>
          <div className='muse-modal-title'>{title}</div>
          <div className='muse-modal-body'>{children}</div>
          <div className='muse-modal-footer'>
            <Button type={cancelButtonType} onClick={onCancel}>
              {cancelButtonText}
            </Button>
            <Button type={okButtonType} onClick={onOk}>
              {okButtonText}
            </Button>
            {extButtons}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Modal;
