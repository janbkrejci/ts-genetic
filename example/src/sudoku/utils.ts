import { SudokuBoard } from './types';

export function formatBoard(board: SudokuBoard): string {
  return board.map((row, i) => {
    const rowStr = row.map((cell, j) => {
      const value = cell === 0 ? '.' : cell.toString();
      return j % 3 === 2 && j < 8 ? `${value} |` : value;
    }).join(' ');
    
    return i % 3 === 2 && i < 8 
      ? `${rowStr}\n${'-'.repeat(21)}`
      : rowStr;
  }).join('\n');
}

export function boardToString(board: SudokuBoard): string {
  return board.flat().join('');
}

export function stringToBoard(str: string): SudokuBoard {
  if (!/^\d{81}$/.test(str)) {
    throw new Error('Invalid input: must be exactly 81 digits');
  }

  const board: SudokuBoard = [];
  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      board[i][j] = parseInt(str[i * 9 + j], 10);
    }
  }
  return board;
}