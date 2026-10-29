import { BadRequestException } from '@nestjs/common';

export class ToolInputUtils {
  static number(input: Record<string, unknown>, key: string): number {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new BadRequestException(`"${key}" must be a number`);
    return value;
  }

  static optionalNumber(input: Record<string, unknown>, key: string): number | undefined {
    return input[key] === undefined || input[key] === null ? undefined : ToolInputUtils.number(input, key);
  }

  static string(input: Record<string, unknown>, key: string): string {
    const value = input[key];
    if (typeof value !== 'string' || !value.trim()) throw new BadRequestException(`"${key}" must be a non-empty string`);
    return value.trim();
  }

  static oneOf<T extends string>(input: Record<string, unknown>, key: string, allowed: readonly T[]): T {
    const value = input[key];
    if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
      throw new BadRequestException(`"${key}" must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
  }
}
