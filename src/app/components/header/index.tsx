import React, { useEffect } from 'react';
import Button from '../button';
import './index.less';

const title = 'rongshu';
const branch = '6.3.0';

const Header: React.FC = () => {
  const handleCheckBranchClick = () => {
    console.log('check branch');
  };

  const handlePublishClick = () => {
    console.log('publish code');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handlePublishClick();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className='header-container'>
      <div className='project-title'>
        <span>{title.toUpperCase()}</span>
        <span className='divider'>/</span>
        <span>{branch}</span>
      </div>

      <div className='muse-btn-group'>
        <Button onClick={handleCheckBranchClick}>分支</Button>
        <Button onClick={handlePublishClick}>发布</Button>
      </div>
    </div>
  );
};

export default Header;
