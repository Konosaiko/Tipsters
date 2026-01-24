/**
 * Tip result enum
 */
export enum TipResult {
  WON = 'WON',
  LOST = 'LOST',
  VOID = 'VOID',
}

/**
 * Sport category enum
 */
export enum Sport {
  FOOTBALL = 'FOOTBALL',
  BASKETBALL = 'BASKETBALL',
  TENNIS = 'TENNIS',
  RUGBY = 'RUGBY',
  MMA = 'MMA',
  BOXING = 'BOXING',
  ESPORTS = 'ESPORTS',
  HOCKEY = 'HOCKEY',
  VOLLEYBALL = 'VOLLEYBALL',
  BASEBALL = 'BASEBALL',
  AMERICAN_FOOTBALL = 'AMERICAN_FOOTBALL',
  OTHER = 'OTHER',
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
  sport?: Sport; // Sport category for filtering
  platform?: string; // Betting platform (e.g., Betclic, Winamax)
  betLink?: string; // Direct link to place the bet
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
  sport?: Sport; // Sport category for filtering
  platform?: string; // Betting platform (e.g., Betclic, Winamax)
  betLink?: string; // Direct link to place the bet
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
  sport: Sport | null;
  platform: string | null;
  betLink: string | null;
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
