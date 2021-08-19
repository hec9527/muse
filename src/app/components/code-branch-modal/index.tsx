import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import Modal from '../modal/';
import './index.less';

const SearchCodeBranchModal: React.FC = () => {
  const state = useSelector((state: AppState) => state);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Modal
      title='代码分支'
      size='small'
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
        <div className='modal-section-body code-branch-wrap'>
          <table>
            <tbody>
              <tr>
                <th>页面</th>
                <th>分支</th>
              </tr>
              {state.codeBranch.map((p) => {
                const arr = p.split('|');
                return (
                  <tr key={p}>
                    <td>{arr?.[0]}</td>
                    <td>{arr?.[1] || 'null'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    </Modal>
  );
};

export default SearchCodeBranchModal;
