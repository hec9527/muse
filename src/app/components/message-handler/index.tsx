import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Types from '../../../index.d';
import { AppDispatch } from '../../store/reducer';

const MessageHandler: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handler = (e: { data: Types.IExtensionMessage }) => {
      const { cmd, data } = e.data;
      if (cmd === 'UPDATE_PROJECT_INFO') {
        dispatch({ type: 'UPDATE_PROJECT_INFO', payload: data });
      }

      switch (cmd) {
        case 'UPDATE_ENV_INFO':
          dispatch({ type: 'UPDATE_SERVER_INFO', payload: data });
        case 'UPDATE_PROJECT_INFO':
          dispatch({ type: 'UPDATE_PROJECT_INFO', payload: data });
          break;
        case 'UPDATE_PAGE_INFO':
          dispatch({ type: 'UPDATE_PAGE_INFO', payload: data });
          break;
        default:
          console.log('re');
      }
    };

    window.addEventListener('message', handler);
    () => window.removeEventListener('message', handler);
  }, []);

  return null;
};

export default MessageHandler;
