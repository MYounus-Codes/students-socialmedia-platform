import { describe, expect, it } from "vitest";
import { getPostInteractionCounts } from "./counts";

describe("post interaction counts", () => {
  it("counts visible likes, dislikes, comments, and the viewer reaction", () => {
    expect(getPostInteractionCounts(
      "post-1",
      "viewer-1",
      [
        { post_id: "post-1", user_id: "viewer-1", reaction_type: "like" },
        { post_id: "post-1", user_id: "viewer-2", reaction_type: "like" },
        { post_id: "post-1", user_id: "viewer-3", reaction_type: "dislike" },
      ],
      [{ post_id: "post-1" }, { post_id: "post-1" }, { post_id: "post-2" }],
    )).toEqual({ likeCount: 2, dislikeCount: 1, commentCount: 2, viewerReaction: "like" });
  });

  it("returns empty interaction state for a post without activity", () => {
    expect(getPostInteractionCounts("post-1", "viewer-1", [], [])).toEqual({ likeCount: 0, dislikeCount: 0, commentCount: 0, viewerReaction: null });
  });
});
