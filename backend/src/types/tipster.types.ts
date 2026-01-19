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
 * Response shape for a tipster
 */
export interface TipsterResponse {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipster with user info
 */
export interface TipsterWithUser {
  id: string;
  displayName: string;
  bio: string | null;
  user: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipster with follow data (for authenticated requests)
 */
export interface TipsterWithFollowData extends TipsterWithUser {
  followerCount: number;
  isFollowing: boolean;
}
