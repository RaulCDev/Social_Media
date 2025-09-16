export class Post {
  // TypeORM entity for the posts table (id, user_id, content, father_id, views_amount, timestamp)
  id!: number;
  user_id!: number;
  content!: string;
  father_id?: number | null;
  views_amount!: number;
  timestamp!: Date;
}
