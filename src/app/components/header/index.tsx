import React, { useEffect } from 'react';
import { IProjectInfo } from '../../../index.d';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import Button from '../button';
import Modal from '../modal';
import './index.less';

const Header: React.FC = () => {
  const { appName, version }: IProjectInfo = useSelector((state: AppState) => state.projectInfo);
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: AppState) => state);

  const checkData = () => {
    if (!state.selectedEnv.name) {
      return (action: string) => `请选择${action}环境`;
    } else if (!state.selectedPages.length) {
      return (action: string) => `请选择${action}页面`;
    }
    return false;
  };

  const handleCheckBranchClick = () => {
    const res = checkData();
    if (res) {
      return dispatch({
        type: 'POST_MESSAGE_TO_EXTENSION',
        payload: {
          cmd: 'SHOW_MESSAGE',
          data: { type: 'error', message: res('查询') },
        },
      });
    }
    dispatch({
      type: 'POST_MESSAGE_TO_EXTENSION',
      payload: {
        cmd: 'QUERY_ONLINE_CODE_BRANCH',
        data: {
          env: state.selectedEnv,
          pages: state.selectedPages,
        },
      },
    });
  };

  const handlePublishClick = () => {
    const res = checkData();
    if (res) {
      return dispatch({
        type: 'POST_MESSAGE_TO_EXTENSION',
        payload: {
          cmd: 'SHOW_MESSAGE',
          data: { type: 'error', message: res('发布') },
        },
      });
    }
    const modalInstance = Modal.show({
      visible: true,
      children: (
        <>
          <h3 className='modal-section-title'>发布环境</h3>
          <div className='modal-section-body'>{state.selectedEnv.name}</div>
          <h3 className='modal-section-title'>发布页面（共发布{state.selectedPages.length}个页面）</h3>
          <div className='modal-section-body'>
            {state.selectedPages.map((p) => (
              <div key={p} className='list-item'>
                {p}
              </div>
            ))}
          </div>
        </>
      ),
      onOk: () => {
        modalInstance.close();
        dispatch({
          type: 'POST_MESSAGE_TO_EXTENSION',
          payload: {
            cmd: 'PUBLISH_CODE',
            data: {
              env: state.selectedEnv,
              pages: state.selectedPages,
            },
          },
        });
      },
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handlePublishClick();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePublishClick]);

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
