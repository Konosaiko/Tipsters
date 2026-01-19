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
 */
export interface CreateTipDto {
  tipsterId: string;
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
 * Response shape for a tip
 */
export interface TipResponse {
  id: string;
  tipsterId: string;
  event: string;
  prediction: string;
  odds: number;
  explanation: string | null;
  result: TipResult | null;
  settledAt: Date | null;
  stake: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response shape for a tip with tipster information
 * Used in public tip listings
 */
export interface TipWithTipster extends TipResponse {
  tipster: {
    id: string;
    displayName: string;
    user: {
      username: string;
    };
  };
}
