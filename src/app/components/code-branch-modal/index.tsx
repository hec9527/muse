import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import Modal from '../modal/';

const SearchCodeBranchModal: React.FC = () => {
  const state = useSelector((state: AppState) => state);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Modal
      title='代码分支'
      visible={state.searchCodeBranchModakVisible}
      showCancelButton={false}
      onOk={() => {
        dispatch({ type: 'UPDATE_SEARCH_CODE_BRANCH_MODAL_VISIBLE', payload: false });
      }}
    >
      <>
        <h3 className='modal-section-title'>代码环境</h3>
        <div className='modal-section-body'>{state.selectedEnv.name}</div>
        <h3 className='modal-section-title'>代码分支</h3>
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

export default SearchCodeBranchModal;
