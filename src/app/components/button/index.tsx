import React from 'react';
import classNames from 'classnames';
import './index.less';

export interface ButtonProps {
  type?: 'primary' | 'text' | 'danger';
  size?: 'middle' | 'small';
  title?: string;
  onClick?: () => void;
  disable?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ type, size, onClick, children, disable, style, title }) => {
  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (disable) {
      return false;
    }
    onClick?.();
  };

  return (
    <div
      style={style}
      title={title}
      className={classNames('muse-button', `muse-button-${type}`, `muse-button-${size}`, {
        'muse-button-disable': disable,
      })}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

Button.defaultProps = {
  type: 'primary',
  size: 'middle',
};

export default Button;
