import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ConfirmProposalDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  lots?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  riskPct?: number;
}
