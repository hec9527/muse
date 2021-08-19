import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import * as Types from '../../../index.d';

// 空组件， 使用 hooks 接收并且处理来自插件的消息
const MessageHandler: React.FC = () => {
  const state = useSelector((state: AppState) => state);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handlerMessage = (e: { data: Types.IExtensionMessage }) => {
      const data = e.data;
      switch (data.cmd) {
        case 'UPDATE_ENV_INFO':
          dispatch({ type: 'UPDATE_SERVER_INFO', payload: data.data });
          break;
        case 'UPDATE_PROJECT_INFO':
          dispatch({ type: 'UPDATE_PROJECT_INFO', payload: data.data });
          break;
        case 'UPDATE_PAGE_INFO':
          dispatch({ type: 'UPDATE_PAGE_INFO', payload: data.data });
          break;
        case 'QUICK_PUBLISH':
          dispatch({ type: 'UPDATE_SELECTED_ENV', payload: data.data.env });
          dispatch({ type: 'UPDATE_SELECTED_PAGE', payload: data.data.pages });
          dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: true });
          break;
        case 'UPDATE_QUERY_CODE_BRANCH_RESULT':
          dispatch({ type: 'UPDATE_SEARCH_CODE_BRAMCH_RESULT', payload: data.data });
          dispatch({ type: 'UPDATE_SEARCH_CODE_BRANCH_MODAL_VISIBLE', payload: true });
          dispatch({ type: 'UPDATE_SEARCH_CODE_BRANCH_LOADING', payload: false });
          break;
        default:
          console.log('未知的消息类型');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: false });
        dispatch({ type: 'UPDATE_SEARCH_CODE_BRANCH_MODAL_VISIBLE', payload: false });
      }
    };

    // 初始化
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_ENV_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PAGE_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PROJECT_INFO' } });

    window.addEventListener('message', handlerMessage);
    window.addEventListener('keydown', handleKeyDown);
    () => {
      window.removeEventListener('message', handlerMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.publishModalVisible, state.searchCodeBranchModakVisible]);

  return null;
};

export default MessageHandler;
