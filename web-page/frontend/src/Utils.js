import React, { useState, useEffect, useCallback } from 'react';

// from https://medium.com/geekculture/unlock-the-power-of-ctrl-z-in-react-state-with-usehistorystate-7f93b7b62924
export const useHistoryState = (initialValue) => {
  const [state, _setState] = useState(initialValue);
  const [history, setHistory] = useState(
    initialValue !== undefined && initialValue !== null ? [initialValue] : []
  );
  const [pointer, setPointer] = useState(
    initialValue !== undefined && initialValue !== null ? 0 : -1
  );

  const setState = useCallback(
    (value) => {
      let valueToAdd = value;
      if (typeof value === 'function') {
        valueToAdd = value(state);
      }
      setHistory((prev) => [...prev.slice(0, pointer + 1), valueToAdd]);
      setPointer((prev) => prev + 1);
      _setState(value);
    },
    [setHistory, setPointer, _setState, state, pointer]
  );

  const undo = useCallback(() => {
    if (pointer <= 0) {
      return;
    }
    _setState(history[pointer - 1]);
    setPointer((prev) => prev - 1);
  }, [history, pointer, setPointer]);

  const redo = useCallback(() => {
    if (pointer + 1 >= history.length) {
      return;
    }
    _setState(history[pointer + 1]);
    setPointer((prev) => prev + 1);
  }, [pointer, history, setPointer]);

  return [state, setState, undo, redo, history, pointer];
};
