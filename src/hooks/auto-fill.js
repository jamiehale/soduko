import { useCallback, useEffect, useRef } from 'react';
import * as R from 'ramda';
import { nextBulkSet, boardWithSetValues } from '../util/board';
import { findErrorCells } from './game';
import { setCellValues } from './board';

const DELAY = 500;

const useAutoFill = ({ board, dispatch }) => {
  const boardRef = useRef(board);
  const timeoutRef = useRef(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const start = useCallback(() => {
    const step = () => {
      const current = boardRef.current;
      const placements = nextBulkSet(current, findErrorCells(current));
      if (R.isEmpty(placements)) {
        timeoutRef.current = null;
        return;
      }
      setCellValues(dispatch, placements);
      // The next round may fire before React renders this one; without this it would re-apply the same placements.
      boardRef.current = boardWithSetValues(placements, current);
      timeoutRef.current = setTimeout(step, DELAY);
    };
    cancel();
    timeoutRef.current = setTimeout(step, DELAY);
  }, [cancel, dispatch]);

  useEffect(() => cancel, [cancel]);

  return { start, cancel };
};

export default useAutoFill;
