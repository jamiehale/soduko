import { useCallback, useEffect, useRef } from 'react';
import * as R from 'ramda';
import { nextBulkSet, boardWithSetValues } from '../util/board';
import { findErrorCells } from './game';
import { setCellValues } from './board';

const DELAY = 500;

// Fills box singles in timed rounds after a player value set. The board is
// kept in a ref, so a timer never sees a stale render, and each round writes
// the board it produced back to the ref, so the next round doesn't depend on
// React having rendered in between. One timeout slot means start() replaces
// any cascade in progress.
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
