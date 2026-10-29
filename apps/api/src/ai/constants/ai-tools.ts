import type { ToolDefinition } from '@/ai/interfaces';

const EMPTY_INPUT = { type: 'object', properties: {} };

export const READ_TOOLS: ToolDefinition[] = [
  {
    name: 'get_chart_context',
    description: 'Symbol, timeframe, last price and the time range of the candles currently loaded on the user chart.',
    inputSchema: EMPTY_INPUT,
  },
  {
    name: 'get_drawings',
    description: 'Everything the user has drawn on the chart. Currently horizontal levels with their exact prices and labels.',
    inputSchema: EMPTY_INPUT,
  },
  {
    name: 'get_candles',
    description: 'The most recent candles on the chart, oldest first.',
    inputSchema: {
      type: 'object',
      properties: { count: { type: 'integer', description: 'How many candles, default 50, max 200.' } },
    },
  },
  {
    name: 'count_level_touches',
    description:
      'Count how many separate times price touched a horizontal level across all loaded candles. Consecutive candles touching the level count as one touch. Also reports whether each touch held (price stayed on the same side) or broke through.',
    inputSchema: {
      type: 'object',
      properties: {
        price: { type: 'number', description: 'The level price.' },
        tolerance: { type: 'number', description: 'Optional band around the level in price units. Defaults to 0.05% of price.' },
      },
      required: ['price'],
    },
  },
  {
    name: 'get_positions',
    description: 'The open positions the user currently has.',
    inputSchema: EMPTY_INPUT,
  },
  {
    name: 'get_orders',
    description: 'The pending orders the user currently has.',
    inputSchema: EMPTY_INPUT,
  },
];

export const PLAN_TOOLS: ToolDefinition[] = [
  {
    name: 'propose_order',
    description:
      'Propose a pending limit or stop order. This only shows the user a Yes/No card; nothing is sent to the broker until the user confirms. Always include a stop loss. If the user has not told you a size, leave riskPct and lots out and the card will ask them.',
    inputSchema: {
      type: 'object',
      properties: {
        side: { type: 'string', enum: ['buy', 'sell'] },
        type: { type: 'string', enum: ['limit', 'stop'] },
        entry: { type: 'number', description: 'Entry price.' },
        sl: { type: 'number', description: 'Stop loss price.' },
        tp: { type: 'number', description: 'Optional take profit price.' },
        riskPct: { type: 'number', description: 'Optional risk as a percent of balance, only if the user chose it.' },
        lots: { type: 'number', description: 'Optional lot size, only if the user chose it.' },
        rationale: { type: 'string', description: 'One or two sentences explaining the trade.' },
      },
      required: ['side', 'type', 'entry', 'sl', 'rationale'],
    },
  },
];

export const MANAGE_TOOLS: ToolDefinition[] = [
  {
    name: 'propose_close_position',
    description: 'Propose closing an open position, fully or partly. Only shows the user a Yes/No card.',
    inputSchema: {
      type: 'object',
      properties: {
        positionId: { type: 'string' },
        volume: { type: 'number', description: 'Optional lots to close. Omit to close all.' },
        rationale: { type: 'string' },
      },
      required: ['positionId', 'rationale'],
    },
  },
  {
    name: 'propose_modify_position',
    description: 'Propose moving the stop loss and/or take profit of an open position. Only shows the user a Yes/No card.',
    inputSchema: {
      type: 'object',
      properties: {
        positionId: { type: 'string' },
        sl: { type: 'number' },
        tp: { type: 'number' },
        rationale: { type: 'string' },
      },
      required: ['positionId', 'rationale'],
    },
  },
];
