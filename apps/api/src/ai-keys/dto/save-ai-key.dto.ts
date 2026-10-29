import { IsString, MaxLength, MinLength } from 'class-validator';

export class SaveAiKeyDto {
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  apiKey!: string;
}
