import React from 'react';
import { useAppDispatch, useAppSelect } from '../../store/reducer';
import Modal from '../modal/';
import './index.less';

const SearchCodeBranchModal: React.FC = () => {
  const state = useAppSelect(s => s);
  const dispatch = useAppDispatch();

  return (
    <Modal
      title='代码分支'
      size='small'
      visible={state.searchCodeBranchModalVisible}
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
              {state.codeBranch.map(p => {
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
