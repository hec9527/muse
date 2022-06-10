import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelect } from '../../store/reducer';
import useCount from '../../hooks/useCount';
import Modal from '../modal';

const PublishCodeModal: React.FC = () => {
  const [count, setCount] = useCount(0);
  const state = useAppSelect(s => s);
  const dispatch = useAppDispatch();

  const handleOnCancel = () => {
    dispatch({ type: 'UPDATE_PUBLISH_MODAL_VISIBLE', payload: false });
  };

  const handlePublishButtonClick = () => {
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
  };

  useEffect(() => {
    setCount(state.publishModalVisible ? 5 : 0);
  }, [state.publishModalVisible]);

  return (
    <Modal
      size='small'
      visible={state.publishModalVisible}
      onCancel={handleOnCancel}
      onOk={handlePublishButtonClick}
      okButtonDisable={count > 0}
      okButtonText={count > 0 ? `请仔细核对(${count}s)` : '发布'}
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
