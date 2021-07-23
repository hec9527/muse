import React from 'react';
import './index.less';

const title = 'rongshu';
const branch = '6.3.0';

const Header: React.FC = () => {
  return (
    <div className='header-container'>
      <div className='project-title'>
        <span>{title}</span>
        <span className='divider'>/</span>
        <span>{branch}</span>
      </div>
    </div>
  );
};

export default Header;
