import React, { useState } from 'react';
import classNames from 'classnames';
import './index.less';

type CacheList = {
  label: string;
  value: string | number;
}[];

const SideBar: React.FC = ({}) => {
  const [visible, setVisible] = useState(true);
  const cacheList: CacheList = [
    { label: '马甲包第一次发布', value: +new Date() },
    { label: '马甲包第二次发布', value: +new Date() },
    { label: '马甲包第三次发布', value: +new Date() },
    { label: '马甲包第四次发布', value: +new Date() },
  ];

  return (
    <div className={classNames('muse-sider-bar', { hide: !visible })}>
      <div className='muse-sider-bar-handler' onClick={() => setVisible((v) => !v)} />
      <div className='muse-sider-bar-title' title='仅包含通过Muse插件发布的记录'>
        发布记录
      </div>

      <div className='muse-sider-bar-main'>
        {cacheList.map((c) => (
          <div className='list-item cache-item' key={c.value}>
            <span>{c.label}</span>
            <span className='cache-item-clear'>X</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
