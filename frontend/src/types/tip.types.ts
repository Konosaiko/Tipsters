/**
 * Tip result enum
 */
export enum TipResult {
  WON = 'WON',
  LOST = 'LOST',
  VOID = 'VOID',
}

/**
 * Request body for creating a new tip
 * Note: tipsterId is auto-detected from JWT on backend
 */
export interface CreateTipDto {
  event: string;
  prediction: string;
  odds: number;
  explanation?: string;
  stake?: number; // In units (e.g., 1u, 2u, 0.5u). Defaults to 1
}

/**
 * Request body for updating a tip
 */
export interface UpdateTipDto {
  event?: string;
  prediction?: string;
  odds?: number;
  explanation?: string;
  stake?: number; // In units (e.g., 1u, 2u, 0.5u)
}

/**
 * Request body for marking a tip result
 */
export interface MarkTipResultDto {
  result: TipResult;
}

/**
 * Tip object
 */
export interface Tip {
  id: string;
  tipsterId: string;
  event: string;
  prediction: string;
  odds: number;
  explanation: string | null;
  result: TipResult | null;
  settledAt: string | null;
  stake: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tip object with tipster information
 * Used in public tip listings
 */
export interface TipWithTipster extends Tip {
  tipster: {
    id: string;
    displayName: string;
    user: {
      username: string;
    };
  };
}
