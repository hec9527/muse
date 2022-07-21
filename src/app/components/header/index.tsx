import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelect } from '../../store/reducer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Button from '../button';
import {
  faBolt,
  faCodeBranch,
  faPaperPlane,
  faSave,
  faTrashAlt,
  faSpinner,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import './index.less';

const Header: React.FC = () => {
  const state = useAppSelect(s => s);
  const dispatch = useAppDispatch();

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
    dispatch({ type: 'UPDATE_SEARCH_PAGE_INFO_LOADING', payload: true });
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
    setTimeout(() => dispatch({ type: 'UPDATE_SEARCH_PAGE_INFO_LOADING', payload: false }), 60 * 1000);
  };

  const handleClearSaveDate = () => {
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'DELETE_CACHE_INFO' } });
  };

  const handleRefreshPageList = () => {
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PAGE_INFO', refresh: true } });
  };

  const handlePublish = () => {
    if (checkData('发布')) return;
    dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: true });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.publishModalVisible || state.searchCodeBranchModalVisible) {
        return;
      }
      if (e.metaKey && e.key === 'Enter') {
        return handleQuickPublish();
      }
      if (e.metaKey && e.key === 's') {
        return handleSaveData();
      }
      if (e.metaKey && e.key === 'e') {
        return handleCheckBranch();
      }
      if (e.metaKey && e.key === 'd') {
        return handleClearSaveDate();
      }
      if (e.metaKey && e.key === 'r') {
        return handleRefreshPageList();
      }
      if (e.key === 'Enter') {
        return handlePublish();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.searchCodeBranchModalVisible, state.publishModalVisible, state.selectedEnv, state.selectedPages]);

  return (
    <div className='header-container'>
      <div className='project-title'>
        <span>{state.projectInfo?.appName?.toUpperCase()}</span>
        <span className='divider'>/</span>
        <span>{state.projectInfo?.version}</span>
      </div>

      <div className='muse-btn-group'>
        <Button title='快捷键（cmd+D）查看历史发布信息，并选择删除' onClick={handleClearSaveDate} type='danger'>
          <FontAwesomeIcon icon={faTrashAlt} />
          清除记录
        </Button>
        <Button title='快捷键（cmd+R）刷新发布页面列表' onClick={handleRefreshPageList}>
          <FontAwesomeIcon icon={faSyncAlt} />
          刷新列表
        </Button>
        <Button title='快捷键（cmd+Enter）读取保存的历史发布信息，快速发布' onClick={handleQuickPublish}>
          <FontAwesomeIcon icon={faBolt} />
          快速发布
        </Button>
        <Button title='快捷键（cmd+S）保存当前发布信息，后续快速发布' onClick={handleSaveData}>
          <FontAwesomeIcon icon={faSave} />
          保存记录
        </Button>
        <Button
          title='快捷键（cmd+E）查看在线代码分支'
          onClick={handleCheckBranch}
          disable={state.queryCodeBranchLoading}
        >
          <FontAwesomeIcon
            icon={state.queryCodeBranchLoading ? faSpinner : faCodeBranch}
            className={classNames({ rotate: state.queryCodeBranchLoading })}
          />
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
