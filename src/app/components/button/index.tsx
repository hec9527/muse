import React from 'react';
import classNames from 'classnames';
import './index.less';

export interface ButtonProps {
  type?: 'primary' | 'text' | 'dashed' | 'danger';
  onClick?: () => void;
  disable?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ type, onClick, children, disable, style }) => {
  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (disable) {
      return false;
    }
    onClick?.();
  };

  return (
    <div
      style={style}
      className={classNames('muse-button', `muse-button-${type}`, { 'muse-button-disable': disable })}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

Button.defaultProps = {
  type: 'primary',
};

export default Button;
