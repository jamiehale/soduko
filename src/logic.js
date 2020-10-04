export const rowFromCount = count => Math.floor(count / 9);
export const columnFromCount = count => count % 9;
export const sectionFromCount = count => Math.floor(rowFromCount(count) / 3) * 3 + Math.floor(columnFromCount(count) / 3);

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
