import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class PositionDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(20)
  row: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(6)
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}
