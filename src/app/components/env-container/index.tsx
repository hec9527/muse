import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store/reducer';
import * as Types from '../../../index.d';
import './index.less';

const ServerEnv: React.FC = ({}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { envInfo, selectedEnv } = useSelector((state: AppState) => ({
    envInfo: state.serverInfo,
    selectedEnv: state.selectedEnv,
  }));

  const handleEnvClick = (env: Types.IEnvConfig) => {
    dispatch({ type: 'UPDATE_SELECTED_ENV', payload: env });
  };

  return envInfo ? (
    <div className='muse-env-container'>
      <div className='section-title'>环境选择</div>
      <div className='section-wrap muse-env-warp'>
        {envInfo.envFilter?.map((f) => (
          <div key={f.key} className='env-group'>
            <div className='env-title'>{f.name}</div>
            <div className='env-list'>
              {envInfo.data[f.key].map((i: Types.IEnvConfig) => (
                <label key={i.name} htmlFor={i.name} className='env-items list-item' title={i.name}>
                  <input
                    name='env'
                    type='radio'
                    className='envs'
                    id={i.name}
                    checked={selectedEnv?.name === i.name}
                    onChange={handleEnvClick.bind(undefined, i)}
                  />
                  <span>{i.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default ServerEnv;
