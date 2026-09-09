import { describe, expect, it } from "vitest";
import { rankRecommendations } from "./rank";
import { scoreRecommendation } from "./scoring";

describe("recommendation scoring", () => {
  it("gives stronger interest matches a higher score", () => {
    const matched = scoreRecommendation({ interestMatch: 1, followingMatch: 0, engagement: 0.5, recency: 0.5, popularity: 0.5 });
    const unmatched = scoreRecommendation({ interestMatch: 0, followingMatch: 0, engagement: 0.5, recency: 0.5, popularity: 0.5 });
    expect(matched).toBeGreaterThan(unmatched);
  });

  it("ranks candidates from highest score to lowest", () => {
    const ranked = rankRecommendations([
      { id: "low", score: 0.2, reason: "" },
      { id: "high", score: 0.9, reason: "" },
    ]);
    expect(ranked.map((candidate) => candidate.id)).toEqual(["high", "low"]);
  });
});
