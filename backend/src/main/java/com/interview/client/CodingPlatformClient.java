package com.interview.client;

import com.interview.dto.CandidatePerformance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Calls the Coding Assessment service for candidate performance data.
 *
 * Failure-mode contract: ALWAYS returns a usable CandidatePerformance.
 * If the Coding service is down, slow, or returns an error, this client
 * returns an empty performance object. An AI interview must NEVER fail
 * to start because the Coding service had a hiccup.
 */
@Component
public class CodingPlatformClient {

    private static final Logger log = LoggerFactory.getLogger(CodingPlatformClient.class);

    private final WebClient webClient;
    private final Duration timeout;

    public CodingPlatformClient(
            WebClient.Builder webClientBuilder,
            @Value("${coding.platform.base.url}") String baseUrl,
            @Value("${coding.platform.timeout.ms:3000}") long timeoutMs
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.timeout = Duration.ofMillis(timeoutMs);
    }

    public CandidatePerformance getPerformance(String clerkUserId) {
        if (clerkUserId == null || clerkUserId.isBlank()) {
            return CandidatePerformance.empty(clerkUserId);
        }
        try {
            CandidatePerformance result = webClient.get()
                    .uri("/users/{id}/performance", clerkUserId)
                    .retrieve()
                    .bodyToMono(CandidatePerformance.class)
                    .block(timeout);

            return result != null ? result : CandidatePerformance.empty(clerkUserId);
        } catch (Exception e) {
            log.warn("Coding platform unreachable for {}: {} — interview will proceed without performance context",
                    clerkUserId, e.getMessage());
            return CandidatePerformance.empty(clerkUserId);
        }
    }
}
