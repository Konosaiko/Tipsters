/**
 * Request body for creating a tipster profile
 */
export interface CreateTipsterDto {
  displayName: string;
  bio?: string;
}

/**
 * Request body for updating a tipster profile
 */
export interface UpdateTipsterDto {
  displayName?: string;
  bio?: string;
}

/**
 * Tipster object
 */
export interface Tipster {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipster with user info and tip count
 */
export interface TipsterWithDetails extends Tipster {
  user: {
    id: string;
    username: string;
    email: string;
  };
  _count?: {
    tips: number;
  };
  tips?: Tip[];
}

// Import Tip type
import { Tip } from './tip.types';
