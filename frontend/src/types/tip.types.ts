/**
 * Request body for creating a new tip
 * Note: tipsterId is auto-detected from JWT on backend
 */
export interface CreateTipDto {
  event: string;
  prediction: string;
  odds: number;
  explanation?: string;
}

/**
 * Request body for updating a tip
 */
export interface UpdateTipDto {
  event?: string;
  prediction?: string;
  odds?: number;
  explanation?: string;
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
  createdAt: string;
}
