import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../store/reducer';
import * as Types from '../../../index.d';
import './index.less';

type keys = keyof Types.IEnvInfo;

type EnvInfo = Types.IEnvInfo[keys][number];

const ServerEnv: React.FC = ({}) => {
  const envInfo = useSelector((state: AppState) => state.serverInfo);

  const handleEnvClick = (env: EnvInfo) => {
    console.log(env);
  };

  console.log(envInfo);

  return envInfo ? (
    <div className='muse-env-container'>
      <div className='section-title'>环境选择</div>
      <div className='section-wrap muse-env-warp'>
        {envInfo.envFilter?.map((f) => (
          <div key={f.key} className='env-group'>
            <div className='env-title'>{f.name}</div>
            <div className='env-list'>
              {envInfo.data[f.key].map((i: EnvInfo) => (
                <label key={i.name} htmlFor={i.name} className='env-items list-item' title={i.name}>
                  <input
                    name='env'
                    type='radio'
                    className='envs'
                    id={i.name}
                    onClick={handleEnvClick.bind(undefined, i)}
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
