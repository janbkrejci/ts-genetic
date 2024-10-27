import { SudokuBoard } from './types';

export const createEmptyBoard = (): SudokuBoard => [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const boardToString = (board: SudokuBoard): string => {
  return board.flat().join('');
};

export const stringToBoard = (input: string): SudokuBoard | null => {
  if (!/^\d{81}$/.test(input)) {
    return null;
  }

  const board: SudokuBoard = [];
  for (let i = 0; i < 9; i++) {
    const row = input.slice(i * 9, (i + 1) * 9)
      .split('')
      .map(n => parseInt(n, 10));
    board.push(row);
  }
  return board;
};

export const formatBoard = (board: SudokuBoard): string => {
  if (!board || !Array.isArray(board) || board.length !== 9) {
    return 'Invalid board';
  }

  const horizontalLine = '+-------+-------+-------+\n';
  let result = horizontalLine;

  for (let i = 0; i < 9; i++) {
    if (i > 0 && i % 3 === 0) {
      result += horizontalLine;
    }
    
    const row = board[i];
    if (!Array.isArray(row) || row.length !== 9) {
      return 'Invalid board row';
    }

    let rowString = '|';
    for (let j = 0; j < 9; j++) {
      if (j > 0 && j % 3 === 0) {
        rowString += ' |';
      }
      const cell = row[j];
      rowString += ` ${cell === 0 ? '.' : cell}`;
    }
    result += `${rowString} |\n`;
  }

  result += horizontalLine;
  return result;
};