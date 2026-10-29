import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsObject, IsString, MaxLength, ValidateNested } from 'class-validator';

const MAX_BARS = 1500;

export class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(8000)
  content!: string;
}

export class ChartContextDto {
  @IsString()
  @MaxLength(32)
  symbol!: string;

  @IsString()
  @MaxLength(16)
  timeframe!: string;

  @IsArray()
  @ArrayMaxSize(MAX_BARS)
  bars!: number[][];

  @IsArray()
  @ArrayMaxSize(100)
  drawings!: Record<string, unknown>[];

  @IsArray()
  @ArrayMaxSize(100)
  positions!: Record<string, unknown>[];

  @IsArray()
  @ArrayMaxSize(100)
  orders!: Record<string, unknown>[];
}

export class ChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => ChartContextDto)
  context!: ChartContextDto;
}
