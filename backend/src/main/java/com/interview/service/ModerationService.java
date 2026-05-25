package com.interview.service;

import lombok.Data;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class ModerationService {

    // Category-tagged keyword lists. Kept simple for MVP; swap for an external
    // moderation API later (OpenAI moderations, Perspective API, etc.).

    private static final Set<String> PROFANITY = Set.of(
            "fuck", "fucking", "fucked", "shit", "bullshit", "bitch", "bastard",
            "asshole", "dickhead", "motherfucker", "cunt", "wanker", "prick",
            "piss off", "screw you", "damn it"
    );

    private static final Set<String> SEXUAL = Set.of(
            "sex", "sexual", "nude", "naked", "porn", "horny", "boobs",
            "penis", "vagina", "blowjob", "handjob", "masturbate", "orgasm",
            "send nudes", "make love", "hookup", "sleep with me"
    );

    private static final Set<String> ABUSIVE = Set.of(
            "idiot", "stupid", "dumb", "moron", "retard", "retarded", "loser",
            "useless", "garbage", "trash", "kill yourself", "kys", "shut up",
            "go to hell", "you suck", "worthless"
    );

    private static final Set<String> HARASSMENT = Set.of(
            "i will hurt you", "i will kill", "threaten", "stalk you",
            "find your address", "dox you", "rape", "molest"
    );

    // Pattern that matches a "whole word" anywhere — case-insensitive
    private Pattern wordPattern(String word) {
        return Pattern.compile("\\b" + Pattern.quote(word) + "\\b", Pattern.CASE_INSENSITIVE);
    }

    public ModerationResult check(String message) {
        if (message == null || message.isBlank()) {
            return ModerationResult.clean();
        }

        String normalized = message.toLowerCase();

        for (String w : HARASSMENT) {
            if (normalized.contains(w.toLowerCase())) {
                return ModerationResult.flagged("HARASSMENT", w);
            }
        }
        for (String w : SEXUAL) {
            if (wordPattern(w).matcher(message).find()) {
                return ModerationResult.flagged("SEXUAL", w);
            }
        }
        for (String w : ABUSIVE) {
            if (wordPattern(w).matcher(message).find() || normalized.contains(w.toLowerCase())) {
                return ModerationResult.flagged("ABUSIVE", w);
            }
        }
        for (String w : PROFANITY) {
            if (wordPattern(w).matcher(message).find()) {
                return ModerationResult.flagged("PROFANITY", w);
            }
        }

        return ModerationResult.clean();
    }

    @Data
    @AllArgsConstructor
    public static class ModerationResult {
        private boolean flagged;
        private String category;
        private String matchedTerm;

        public static ModerationResult clean() {
            return new ModerationResult(false, null, null);
        }

        public static ModerationResult flagged(String category, String term) {
            return new ModerationResult(true, category, term);
        }

        public String getReason() {
            if (!flagged) return null;
            return "Inappropriate conduct: " + category + " (matched term: " + matchedTerm + ")";
        }
    }

    public List<String> getAllCategories() {
        return List.of("PROFANITY", "SEXUAL", "ABUSIVE", "HARASSMENT");
    }
}
