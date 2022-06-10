import React from 'react';
import Button, { ButtonProps } from '../button';
import './index.less';

export interface ModalProps {
  visible: boolean;
  size?: 'small' | 'middle' | 'large';
  title?: string;
  okButtonType?: ButtonProps['type'];
  okButtonText?: string;
  okButtonDisable?: boolean;
  cancelButtonType?: ButtonProps['type'];
  cancelButtonText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  extButtons?: React.ReactFragment;
  showOkButton?: boolean;
  showCancelButton?: boolean;
  children?: React.ReactChild;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  size,
  title,
  onOk,
  onCancel,
  children,
  extButtons,
  okButtonText,
  okButtonType,
  okButtonDisable,
  cancelButtonText,
  cancelButtonType,
  showCancelButton,
  showOkButton,
}) => {
  return visible ? (
    <div className='muse-modal'>
      <div className='muse-modal-mask' />
      <div className='muse-modal-content'>
        <div className={`muse-modal-main muse-modal-${size}`}>
          <div className='muse-modal-title'>{title}</div>
          <div className='muse-modal-body better-scrollbar'>{children}</div>
          <div className='muse-modal-footer'>
            {showCancelButton && (
              <Button type={cancelButtonType} onClick={onCancel}>
                {cancelButtonText}
              </Button>
            )}
            {showOkButton && (
              <Button type={okButtonType} onClick={onOk} disable={okButtonDisable}>
                {okButtonText}
              </Button>
            )}
            {extButtons}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

Modal.defaultProps = {
  title: '确认发布',
  size: 'middle',
  okButtonText: '确认',
  okButtonType: 'primary',
  cancelButtonText: '取消',
  cancelButtonType: 'text',
  showCancelButton: true,
  showOkButton: true,
};

export default Modal;
