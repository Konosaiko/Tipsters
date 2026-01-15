/**
 * Request body for creating a new tip
 */
export interface CreateTipDto {
  tipsterId: string;
  event: string;
  prediction: string;
  odds: number;
  explanation?: string;
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
  createdAt: Date;
}
