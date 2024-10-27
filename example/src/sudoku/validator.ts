import { SudokuBoard } from './types';
import * as R from 'ramda';

export const isValidGroup = (group: number[]): boolean => {
  const numbers = group.filter(n => n !== 0);
  const unique = new Set(numbers);
  return unique.size === numbers.length;
};

export const isValidBoard = (board: SudokuBoard): boolean => {
  // Check rows
  const validRows = board.every(isValidGroup);
  if (!validRows) return false;

  // Check columns
  const columns = R.transpose(board);
  const validColumns = columns.every(isValidGroup);
  if (!validColumns) return false;

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const box: number[] = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          box.push(board[boxRow + i][boxCol + j]);
        }
      }
      if (!isValidGroup(box)) return false;
    }
  }

  return true;
};