import { useEffect, useRef } from 'react';

// Listens for `type` events on window. The listener is registered once per
// event type; the latest handler is read from a ref, so passing a new handler
// on each render does not re-register it.
const useWindowEvent = (type, handler) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event) => handlerRef.current(event);
    window.addEventListener(type, listener);
    return () => {
      window.removeEventListener(type, listener);
    };
  }, [type]);
};

export default useWindowEvent;
