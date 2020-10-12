import React, { useCallback, useState } from 'react';
import * as R from 'ramda';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import stockPuzzles from './puzzles/top95';
import { Typography } from '@material-ui/core';

const TabPanel = ({
  children,
  value,
  index,
  ...props
}) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...props}
  >
    {value === index && (
      <Box p={3}>
        {children}
      </Box>
    )}
  </div>
);

const NewGameDialog = ({
  onNewGame,
  onCancel,
}) => {
  const [tab, setTab] = useState(0);
  const [puzzle, setPuzzle] = useState('');
  const [stockPuzzle, setStockPuzzle] = useState('');

  const handleChangePuzzle = useCallback((e) => {
    setPuzzle(R.replace(/[^[0-9]\.]/g, '', e.target.value));
  }, [setPuzzle]);

  const handleNewGame = useCallback(() => {
    if (tab === 0) {
      onNewGame(stockPuzzle);
    } else {
      onNewGame(puzzle);
    }
  }, [onNewGame, puzzle, stockPuzzle]);

  const isValid = (tab === 0 && !R.isEmpty(stockPuzzle)) || (tab === 1 && R.length(puzzle) === 81);

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeStockPuzzle = (e) => {
    setStockPuzzle(e.target.value);
  };

  const stockPuzzleOptions = R.addIndex(R.map)(
    (stockPuzzle, i) => (
      <MenuItem
        key={i + 1}
        value={stockPuzzle}
      >
        {i + 1}:&nbsp;<pre style={{ display: 'inline' }}>{R.slice(0, 20, stockPuzzle)}...</pre>
      </MenuItem>
    ),
    stockPuzzles,
  );

  return (
    <Dialog
      open
      onClose={onCancel}
    >
      <DialogTitle>New Game</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="Stock" />
          <Tab label="Custom" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <Select
            value={stockPuzzle}
            fullWidth
            onChange={handleChangeStockPuzzle}
          >
            {stockPuzzleOptions}
          </Select>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <TextField
            label="Puzzle"
            value={puzzle}
            InputProps={{ inputProps: { maxLength: 81 } }}
            placeholder="123456789..."
            fullWidth
            onChange={handleChangePuzzle}
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleNewGame} disabled={!isValid}>Start</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewGameDialog;
