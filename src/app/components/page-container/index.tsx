import React, { useEffect, useState } from 'react';
import { useAppSelect, useAppDispatch } from '../../store/reducer';
import classNames from 'classnames';
import './index.less';

const f = (n: number) => `${n < 10 ? 0 : ''}${n}`;

const PageContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [pageList, selectedPages, hideDisabledFilter] = useAppSelect(
    s => [s.pageList, s.selectedPages, s.extensionConfig.hideDisabledFilter] as const
  );

  const [filter, setFilter] = useState('');
  const [checkAll, setCheckAll] = useState(false);
  const [checkOpposite, setCheckOpposite] = useState(false);
  const [filterChars, setFilterChars] = useState<string[]>([]);
  const checkAllRef = React.createRef<HTMLInputElement>();

  const setSelectedPages = (payload: string[]) => {
    dispatch({ type: 'UPDATE_SELECTED_PAGE', payload });
  };

  const handleCheckAll = () => {
    if (pageList.length === selectedPages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pageList);
    }
  };

  const handleCheckOpposite = () => {
    setCheckOpposite(c => !c);
    setSelectedPages(pageList.filter(p => !selectedPages.includes(p)));
  };

  const handlePageItemClick = (page: string) => {
    if (selectedPages.includes(page)) {
      setSelectedPages(selectedPages.filter(p => p !== page));
    } else {
      setSelectedPages([...selectedPages, page]);
    }
  };

  const renderFilter = () => {
    const list: JSX.Element[] = [];
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      const disabled = !filterChars.includes(char);
      if (disabled && hideDisabledFilter) continue;
      const el = (
        <label
          className={classNames('filter-char', { disabled })}
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
      <label className='filter-clear' title='???????????????' onClick={() => setFilter('')} key='clear'>
        X
      </label>
    );
    return <div className='muse-page-filter'>{list}</div>;
  };

  useEffect(() => {
    if (selectedPages.length && selectedPages.length !== pageList.length) {
      checkAllRef.current!.indeterminate = true;
    } else {
      checkAllRef.current!.indeterminate = false;
    }
    if (selectedPages.length === pageList.length) {
      setCheckAll(true);
      setCheckOpposite(false);
    } else {
      setCheckAll(false);
    }
  }, [selectedPages, pageList]);

  useEffect(() => {
    const set = new Set<string>();
    const reg = /^src\/p\/(\w).*$/i;
    pageList.forEach(p => {
      const res = reg.exec(p);
      if (res?.[1]) {
        set.add(res[1].toLocaleUpperCase());
      }
    });
    setFilterChars(Array.from(set));
  }, [pageList]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'a') {
        handleCheckAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCheckAll]);

  return (
    <div className='muse-page-container'>
      <div className='section-title'>
        <span>????????????</span>
        <label className='check-wrap' htmlFor='check-all'>
          <input
            ref={checkAllRef}
            type='checkbox'
            name='check-all'
            id='check-all'
            onChange={handleCheckAll}
            checked={checkAll}
          />
          <span>??????</span>
        </label>
        <label className='check-wrap' htmlFor='check-opposite'>
          <input
            type='checkbox'
            name='check-opposite'
            id='check-opposite'
            checked={checkOpposite}
            onChange={handleCheckOpposite}
          />
          <span>??????</span>
        </label>
      </div>

      {renderFilter()}

      <div className='section-wrap muse-page-wrap'>
        {pageList.map((p, i) => (
          <label
            className={classNames('page-item list-item', {
              hide: !new RegExp(`^src/p/${filter}.*$`, 'i').test(p),
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
              checked={selectedPages.includes(p)}
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
