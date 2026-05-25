package com.interview.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

/**
 * Mirror of the Coding service's CandidatePerformance response.
 * Deserialized by CodingPlatformClient and passed to GroqService to
 * personalize the interview prompt.
 *
 * Marked @JsonIgnoreProperties so future field additions on the Coding
 * side don't break deserialization here.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CandidatePerformance(
        String clerkUserId,
        int totalSubmissions,
        int totalAccepted,
        double acceptanceRate,
        int uniqueSolved,
        Map<String, DifficultyStats> byDifficulty,
        List<TagStat> byTag,
        List<String> weakTags,
        List<String> strongTags
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DifficultyStats(int attempted, int solved) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TagStat(String tag, int attempted, int solved, double accuracy) {}

    public static CandidatePerformance empty(String clerkUserId) {
        return new CandidatePerformance(
                clerkUserId, 0, 0, 0.0, 0,
                Map.of(), List.of(), List.of(), List.of()
        );
    }

    public boolean hasAnyData() {
        return totalSubmissions > 0;
    }
}
