import { useEffect, useRef, useState } from 'react';

export default function (time = 0) {
  const [count, setCount] = useState(time);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (count > 0) {
      timer.current = setTimeout(() => {
        setCount(c => --c);
      }, 1000);
    }
  }, [count]);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return [count, setCount] as const;
}
