package com.interview.service;

import com.interview.client.CodingPlatformClient;
import com.interview.dto.CandidatePerformance;
import com.interview.dto.InterviewDto;
import com.interview.dto.StartInterviewRequest;
import com.interview.dto.StartInterviewResponse;
import com.interview.model.Interview;
import com.interview.model.Message;
import com.interview.model.User;
import com.interview.repository.InterviewRepository;
import com.interview.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final GroqService groqService;
    private final CodingPlatformClient codingPlatformClient;

    @Transactional
    public StartInterviewResponse startInterview(StartInterviewRequest req) {
        User user = userService.findByClerkId(req.getClerkId());

        Interview interview = Interview.builder()
                .user(user)
                .role(req.getRole())
                .status(Interview.InterviewStatus.ACTIVE)
                .build();
        interview = interviewRepository.save(interview);

        // Fetch coding performance from sibling service (graceful-fails to empty)
        CandidatePerformance performance = codingPlatformClient.getPerformance(user.getClerkId());

        // Generate opening message from AI, personalized with coding performance
        String opening = groqService.generateResponse(
                req.getRole(), user.getName(), performance, new ArrayList<>());

        Message firstMessage = Message.builder()
                .interview(interview)
                .sender(Message.SenderType.AI)
                .content(opening)
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(firstMessage);

        return new StartInterviewResponse(interview.getId(), opening);
    }

    @Transactional
    public void endInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));
        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        interview.setEndTime(LocalDateTime.now());
        interviewRepository.save(interview);
    }

    public List<InterviewDto> getUserInterviews(String clerkId) {
        // Return empty list if user has never been synced to DB yet
        return userService.findByClerkIdOptional(clerkId)
                .map(user -> interviewRepository.findByUserOrderByStartTimeDesc(user)
                        .stream()
                        .map(iv -> new InterviewDto(
                                iv.getId(),
                                iv.getRole(),
                                iv.getStartTime(),
                                iv.getEndTime(),
                                iv.getStatus().name()
                        ))
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    public InterviewDto getInterviewById(Long id) {
        Interview iv = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + id));
        return new InterviewDto(iv.getId(), iv.getRole(), iv.getStartTime(), iv.getEndTime(), iv.getStatus().name());
    }
}
