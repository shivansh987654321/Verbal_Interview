package com.interview.controller;

import com.interview.dto.InterviewDto;
import com.interview.dto.StartInterviewRequest;
import com.interview.dto.StartInterviewResponse;
import com.interview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/start")
    public ResponseEntity<StartInterviewResponse> startInterview(@RequestBody StartInterviewRequest req) {
        StartInterviewResponse response = interviewService.startInterview(req);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<String> endInterview(@PathVariable Long id) {
        interviewService.endInterview(id);
        return ResponseEntity.ok("Interview ended");
    }

    @GetMapping("/user/{clerkId}")
    public ResponseEntity<?> getUserInterviews(@PathVariable String clerkId) {
        try {
            List<InterviewDto> result = interviewService.getUserInterviews(clerkId);
            System.out.println("[DEBUG] getUserInterviews(" + clerkId + ") returned " + result.size() + " interviews");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("==================== HISTORY ERROR ====================");
            System.err.println("clerkId: " + clerkId);
            System.err.println("Exception class: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================================");
            return ResponseEntity.status(500).body(
                java.util.Map.of(
                    "error", e.getClass().getSimpleName(),
                    "message", e.getMessage() == null ? "null" : e.getMessage()
                )
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> getInterview(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewById(id));
    }
}
