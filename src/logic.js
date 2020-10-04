export const cellValue = (cell) => {
  if (cell.boardValue !== '.') {
    return cell.boardValue;
  }
  if (cell.userValue !== '') {
    return cell.userValue;
  }
  return undefined;
};

export const boardCellValue = (board, cell) => cellValue(board[cell]);
