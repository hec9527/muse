import React from 'react';
import { useAppDispatch, useAppSelect } from '../../store/reducer';
import Modal from '../modal/';
import './index.less';

const PublishCodeModal: React.FC = () => {
  const state = useAppSelect(s => s);
  const dispatch = useAppDispatch();

  const handleOnCancel = () => {
    dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: false });
  };

  return (
    <Modal
      size='small'
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
        <div className='modal-section-body' title={state.selectedEnv.name}>
          {state.selectedEnv.name}
        </div>
        <h3 className='modal-section-title'>发布页面（共发布{state.selectedPages.length}个页面）</h3>
        <div className='modal-section-body'>
          {state.selectedPages.map(p => (
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
