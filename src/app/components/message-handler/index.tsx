import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelect } from '../../store/reducer';
import * as Types from '../../../index.d';

// 拉取发布信息失败，重试次数
let times = 0;

// 空组件， 使用 hooks 接收并且处理来自插件的消息，同时发送消息给插件
const MessageHandler: React.FC = () => {
  const state = useAppSelect(s => s);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 初始化
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_ENV_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PAGE_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PROJECT_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_EXTENSIONCONFIG' } });
  }, []);

  useEffect(() => {
    const handlerMessage = (e: { data: Types.IExtensionMessage }) => {
      const data = e.data;
      switch (data.cmd) {
        case 'UPDATE_ENV_INFO':
          if (data.data.data) {
            dispatch({ type: 'UPDATE_SERVER_INFO', payload: data.data });
          }
          // 如果启动webview时，插件还未获取到发布服务器信息，2000ms后重试
          else {
            if (times < 3) {
              times++;
              setTimeout(() => dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_ENV_INFO' } }), 2000);
            } else {
              dispatch({
                type: 'POST_MESSAGE_TO_EXTENSION',
                payload: { cmd: 'SHOW_MESSAGE', data: { message: '拉取环境信息失败，请检查网络连接', type: 'error' } },
              });
            }
          }
          break;
        case 'UPDATE_PROJECT_INFO':
          dispatch({ type: 'UPDATE_PROJECT_INFO', payload: data.data });
          break;
        case 'UPDATE_PAGE_INFO':
          dispatch({ type: 'UPDATE_PAGE_INFO', payload: data.data });
          break;
        case 'UPDATE_EXTENSIONCONFIG':
          dispatch({ type: 'UPDATE_EXTENSIONCONFIG', payload: data.data });
          break;
        case 'QUICK_PUBLISH':
          dispatch({ type: 'UPDATE_SELECTED_ENV', payload: data.data.env });
          dispatch({ type: 'UPDATE_SELECTED_PAGE', payload: data.data.pages });
          if (state.extensionConfig.autoOpenQuickPublishModal) {
            dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: true });
          }
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

    window.addEventListener('message', handlerMessage);
    window.addEventListener('keydown', handleKeyDown);
    () => {
      window.removeEventListener('message', handlerMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.publishModalVisible, state.searchCodeBranchModalVisible, state.extensionConfig]);

  return null;
};

export default MessageHandler;
