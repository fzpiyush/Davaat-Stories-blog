export type EngagementKind = "blog" | "story";
export type ViewKind = "blog" | "chapter";

export type Viewer = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
};

export type LikeState = {
  count: number;
  liked: boolean;
};

export type CommentAuthor = {
  name: string;
  avatarUrl: string | null;
  isAuthor: boolean;
};

export type PublicComment = {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  editedAt: string | null;
  isRemoved: boolean;
  isMine: boolean;
  author: CommentAuthor | null;
  replies: PublicComment[];
};

export type CommentsPayload = {
  comments: PublicComment[];
  count: number;
  viewer: Viewer | null;
};

export type ActionResult = { ok: true } | { ok: false; message: string };
