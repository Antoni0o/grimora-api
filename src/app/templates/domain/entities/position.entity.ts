export class Position {
  readonly row: number;
  readonly col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  toString(): string {
    return `${this.row}-${this.col}`;
  }

  static fromString(positionStr: string): Position {
    const [row, col] = positionStr.split('-').map(Number);
    return new Position(row, col);
  }
}
