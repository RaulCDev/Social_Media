export interface CardDto {
  // Represents a feed card with counts and liked flag.
  id: number;
  userFullName: string;
  userName: string;
  avatarUrl: string;
  content: string;
  likes: number;
  views: number;
  comments: number;
  isLiked: boolean;
}

export interface PostWithCommentsDto {
  // Represents a post, its aggregated metrics, and its comments with their metrics.
  id: number;
  userFullName: string;
  userName: string;
  avatarUrl: string;
  content: string;
  comments_amount: number;
  likes_amount: number;
  views_amount: number;
  isLiked: boolean;
  comments: Array<{
    id: number;
    userFullName: string;
    userName: string;
    avatarUrl: string;
    content: string;
    likes_amount: number;
    views_amount: number;
    comments_amount: number;
    isLiked: boolean;
  }>;
}

export interface PostBasicDto {
  // Minimal post data for detail views.
  id: number;
  userFullName: string;
  userName: string;
  avatarUrl: string;
  content: string;
}
