import React, { useEffect } from 'react';
import { IProjectInfo } from '../../../index.d';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import { faBolt, faCodeBranch, faPaperPlane, faSave, faTrashAlt, spinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../button';
import Modal from '../modal';
import './index.less';

const Header: React.FC = () => {
  const { appName, version }: IProjectInfo = useSelector((state: AppState) => state.projectInfo);
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: AppState) => state);

  const checkData = (action: string) => {
    let message;
    if (!state.selectedEnv.name) {
      message = `请选择${action}环境`;
    } else if (!state.selectedPages.length) {
      message = `请选择${action}页面`;
    }
    if (message) {
      dispatch({
        type: 'POST_MESSAGE_TO_EXTENSION',
        payload: { cmd: 'SHOW_MESSAGE', data: { type: 'error', message } },
      });
      return true;
    }
    return false;
  };

  const handleQuickPublish = () => {
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'SHOW_CACHE_LIST' } });
  };

  const handleSaveData = () => {
    if (checkData('发布')) return;
    dispatch({
      type: 'POST_MESSAGE_TO_EXTENSION',
      payload: {
        cmd: 'SAVE_CACHE_INFO',
        data: {
          env: state.selectedEnv,
          pages: state.selectedPages,
        },
      },
    });
  };

  const handleCheckBranch = () => {
    if (checkData('查询')) return;
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

  const handleClearSaveDate = () => {
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'DELETE_CACHE_INFO' } });
  };

  const handlePublish = () => {
    if (checkData('发布')) return;
    dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: true });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter') {
        return handleQuickPublish();
      }
      if (e.metaKey && e.key === 's') {
        return handleSaveData();
      }
      if (e.metaKey && e.key === 'e') {
        return handleCheckBranch();
      }
      if (e.key === 'Enter') {
        return handlePublish();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickPublish, handlePublish, handleSaveData, handleCheckBranch]);

  return (
    <div className='header-container'>
      <div className='project-title'>
        <span>{appName?.toUpperCase()}</span>
        <span className='divider'>/</span>
        <span>{version}</span>
      </div>

      <div className='muse-btn-group'>
        <Button title='快捷键（cmd+）查看历史发布信息，并选择删除' onClick={handleClearSaveDate} type='danger'>
          <FontAwesomeIcon icon={faTrashAlt} />
          清除记录
        </Button>
        <Button title='快捷键（cmd+Enter）读取保存的历史发布信息，快速发布' onClick={handleQuickPublish}>
          <FontAwesomeIcon icon={faBolt} />
          快速发布
        </Button>
        <Button title='快捷键（cmd+S）保存当前发布信息，后续快速发布' onClick={handleSaveData}>
          <FontAwesomeIcon icon={faSave} />
          保存记录
        </Button>
        <Button title='快捷键（cmd+E）查看在线代码分支' onClick={handleCheckBranch}>
          <FontAwesomeIcon icon={faCodeBranch} />
          分支查询
        </Button>
        <Button title='快捷键（Enter）发布代码' onClick={handlePublish}>
          <FontAwesomeIcon icon={faPaperPlane} />
          发布代码
        </Button>
      </div>
    </div>
  );
};

export default Header;
