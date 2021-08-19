import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import Modal from '../modal/';

const PublishCodeModal: React.FC = () => {
  const state = useSelector((state: AppState) => state);
  const dispatch = useDispatch<AppDispatch>();

  const handleOnCancel = () => {
    dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: false });
  };

  return (
    <Modal
      visible={state.publishModalVisible}
      onCancel={handleOnCancel}
      onOk={() => {
        handleOnCancel();
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
      }}
    >
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
    </Modal>
  );
};

export default PublishCodeModal;