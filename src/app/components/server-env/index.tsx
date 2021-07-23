import React from 'react';
import './index.less';

interface IEnvInfo {
  title: string;
  items: { label: string; value: string }[];
}

const ServerEnv: React.FC = ({}) => {
  // { envInfo: IEnvInfo[] }
  const envInfo: IEnvInfo[] = [
    {
      title: '日常环境',
      items: [
        { label: 'd1.日常一套', value: 'd1' },
        { label: 'd2.日常二套', value: 'd2' },
        { label: 'd3.日常三套', value: 'd3' },
        { label: 'd4.日常四套', value: 'd4' },
      ],
    },
    {
      title: '灰度环境',
      items: [
        { label: '灰度一套', value: 'g1' },
        { label: '灰度二套', value: 'g2' },
        { label: '灰度三套', value: 'g3' },
      ],
    },
    {
      title: '线上环境',
      items: [
        { label: '线上一套', value: 'o1' },
        { label: '线上二套', value: 'o2' },
        { label: '线上三套', value: 'o3' },
      ],
    },
  ];

  return (
    <div className='server-env-container'>
      <div className='section-title'>环境选择</div>
      <div className='server-env-warp'>
        {envInfo.map((e) => (
          <div key={e.title} className='env-group'>
            <div className='env-title'>{e.title}</div>
            <div className='env-list'>
              {e.items.map((i) => (
                <label key={i.label} htmlFor={i.value} className='env-items list-item' title={i.label}>
                  <input
                    name='env'
                    type='radio'
                    className='envs'
                    id={i.value}
                    data-name={e.title}
                    data-value={i.value}
                  />
                  <span>{i.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerEnv;
