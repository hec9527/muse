import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Types from '../../../index.d';
import { AppDispatch } from '../../store/reducer';

// 空组件， 使用hooks 接受并且处理来自插件的消息
const MessageHandler: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handler = (e: { data: Types.IExtensionMessage }) => {
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
        default:
          console.log('未知的消息类型');
      }
    };

    // 初始化
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_ENV_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PAGE_INFO' } });
    dispatch({ type: 'POST_MESSAGE_TO_EXTENSION', payload: { cmd: 'GET_PROJECT_INFO' } });

    window.addEventListener('message', handler);
    () => window.removeEventListener('message', handler);
  }, []);

  return null;
};

export default MessageHandler;
