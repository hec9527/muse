import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, AppDispatch } from '../../store/reducer';
import classNames from 'classnames';
import './index.less';

const f = (n: number) => `${n < 10 ? 0 : ''}${n}`;

const PageContainer: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const checkAllRef = React.createRef<HTMLInputElement>();
  const pageList = useSelector((state: AppState) => state.pageList);
  const checkList = useSelector((state: AppState) => state.checkList);

  const [checkAll, setCheckAll] = useState(false);
  const [checkOpposite, setCheckOpposite] = useState(false);
  const [filter, setFilter] = useState('');
  const [filterChars, setFilterChars] = useState<string[]>([]);

  const setCheckList = (payload: string[]) => {
    dispatch({ type: 'UPDATE_SELECTED_PAGE', payload });
  };

  const handleCheckAllClick = () => {
    if (pageList.length === checkList.length) {
      setCheckList([]);
    } else {
      setCheckList(pageList);
    }
  };

  const handleCheckOppositeClick = () => {
    setCheckOpposite((c) => !c);
    setCheckList(pageList.filter((p) => !checkList.includes(p)));
  };

  const handlePageItemClick = (page: string) => {
    if (checkList.includes(page)) {
      setCheckList(checkList.filter((p) => p !== page));
    } else {
      setCheckList([...checkList, page]);
    }
  };

  const renderFilter = () => {
    const list: JSX.Element[] = [];
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      const disabled = !filterChars.includes(char);
      const el = (
        <label
          className={classNames(`filter-char`, { disabled })}
          htmlFor={`filter-${char}`}
          title={char}
          key={char}
          onClick={() => !disabled && setFilter(char)}
        >
          <input
            className='filter-radio hide'
            type='radio'
            name='filter'
            id={`filter-${char}`}
            value={char}
            disabled={disabled}
            checked={char === filter}
          />
          <span>{char}</span>
        </label>
      );
      list.push(el);
    }
    list.push(
      <label className='filter-clear' title='清除过滤器' onClick={() => setFilter('')} key='clear'>
        X
      </label>
    );
    return <div className='muse-page-filter'>{list}</div>;
  };

  useEffect(() => {
    if (checkList.length && checkList.length !== pageList.length) {
      checkAllRef.current!.indeterminate = true;
    } else {
      checkAllRef.current!.indeterminate = false;
    }
    if (checkList.length === pageList.length) {
      setCheckAll(true);
      setCheckOpposite(false);
    } else {
      setCheckAll(false);
    }
  }, [checkList, pageList]);

  useEffect(() => {
    const set = new Set<string>();
    const reg = /^src\/p\/(\w).*$/i;
    pageList.forEach((p) => {
      const res = reg.exec(p);
      if (res?.[1]) {
        set.add(res[1].toLocaleUpperCase());
      }
    });
    setFilterChars(Array.from(set));
  }, [pageList]);

  return (
    <div className='muse-page-container'>
      <div className='section-title'>
        <span>页面选择</span>
        <label className='check-wrap' htmlFor='check-all'>
          <input
            ref={checkAllRef}
            type='checkbox'
            name='check-all'
            id='check-all'
            onChange={handleCheckAllClick}
            checked={checkAll}
          />
          <span>全选</span>
        </label>
        <label className='check-wrap' htmlFor='check-opposite'>
          <input
            type='checkbox'
            name='check-opposite'
            id='check-opposite'
            checked={checkOpposite}
            onChange={handleCheckOppositeClick}
          />
          <span>反选</span>
        </label>
      </div>

      {renderFilter()}

      <div className='section-wrap muse-page-wrap'>
        {pageList.map((p, i) => (
          <label
            className={classNames(`page-item list-item`, {
              hide: !new RegExp(`^src\/p\/${filter}.*$`, 'i').test(p),
            })}
            htmlFor={`page-${i}`}
            title={p}
            key={p}
          >
            <input
              type='checkbox'
              className='pages'
              name='pages'
              id={`page-${i}`}
              value={p}
              checked={checkList.includes(p)}
              onChange={handlePageItemClick.bind(undefined, p)}
            />
            <span>{`${f(i + 1)}.${p}`}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PageContainer;
