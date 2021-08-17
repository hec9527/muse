import React, { useEffect } from 'react';
import { IProjectInfo } from '../../../index.d';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import Button from '../button';
import './index.less';

const Header: React.FC = () => {
  const { appName, version }: IProjectInfo = useSelector((state: AppState) => state.projectInfo);
  const dispatch = useDispatch<AppDispatch>();

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
        <span>{appName?.toUpperCase()}</span>
        <span className='divider'>/</span>
        <span>{version}</span>
      </div>

      <div className='muse-btn-group'>
        <Button onClick={handleCheckBranchClick}>分支</Button>
        <Button onClick={handlePublishClick}>发布</Button>
      </div>
    </div>
  );
};

export default Header;
