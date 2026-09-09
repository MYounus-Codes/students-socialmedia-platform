export interface ReactionRow {
  post_id: string;
  user_id: string;
  reaction_type: "like" | "dislike";
}

export interface CommentRow {
  post_id: string;
}

export function getPostInteractionCounts(
  postId: string,
  viewerId: string,
  reactions: ReactionRow[],
  comments: CommentRow[],
) {
  const postReactions = reactions.filter((reaction) => reaction.post_id === postId);

  return {
    likeCount: postReactions.filter((reaction) => reaction.reaction_type === "like").length,
    dislikeCount: postReactions.filter((reaction) => reaction.reaction_type === "dislike").length,
    commentCount: comments.filter((comment) => comment.post_id === postId).length,
    viewerReaction: postReactions.find((reaction) => reaction.user_id === viewerId)?.reaction_type ?? null,
  };
}
