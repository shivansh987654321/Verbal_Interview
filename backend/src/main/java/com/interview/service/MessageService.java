package com.interview.service;

import com.interview.client.CodingPlatformClient;
import com.interview.dto.CandidatePerformance;
import com.interview.dto.MessageDto;
import com.interview.dto.SendMessageRequest;
import com.interview.dto.SendMessageResponse;
import com.interview.model.Interview;
import com.interview.model.Message;
import com.interview.repository.InterviewRepository;
import com.interview.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private static final String TERMINATION_MESSAGE =
            "This interview has been terminated due to inappropriate conduct.";

    private final MessageRepository messageRepository;
    private final InterviewRepository interviewRepository;
    private final GroqService groqService;
    private final ModerationService moderationService;
    private final CodingPlatformClient codingPlatformClient;

    @Transactional
    public SendMessageResponse processUserMessage(SendMessageRequest req) {
        Interview interview = interviewRepository.findById(req.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found: " + req.getInterviewId()));

        if (interview.getStatus() != Interview.InterviewStatus.ACTIVE) {
            throw new RuntimeException("Interview is not active");
        }

        // ---- MODERATION CHECK (before saving or calling AI) ----
        ModerationService.ModerationResult check = moderationService.check(req.getMessage());
        if (check.isFlagged()) {
            // Persist the offending message for audit
            Message offending = Message.builder()
                    .interview(interview)
                    .sender(Message.SenderType.USER)
                    .content(req.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build();
            messageRepository.save(offending);

            // Persist a terminating AI message so the transcript is complete
            Message terminationMsg = Message.builder()
                    .interview(interview)
                    .sender(Message.SenderType.AI)
                    .content(TERMINATION_MESSAGE)
                    .timestamp(LocalDateTime.now())
                    .build();
            messageRepository.save(terminationMsg);

            // Update interview record
            interview.setStatus(Interview.InterviewStatus.TERMINATED);
            interview.setTerminationReason(check.getReason());
            interview.setTerminatedAt(LocalDateTime.now());
            interview.setEndTime(LocalDateTime.now());
            interviewRepository.save(interview);

            return SendMessageResponse.terminated(TERMINATION_MESSAGE, check.getReason());
        }

        // ---- NORMAL FLOW ----
        Message userMessage = Message.builder()
                .interview(interview)
                .sender(Message.SenderType.USER)
                .content(req.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(userMessage);

        List<Message> history = messageRepository.findByInterviewOrderByTimestampAsc(interview);

        String candidateName = interview.getUser() != null ? interview.getUser().getName() : null;
        String clerkId = interview.getUser() != null ? interview.getUser().getClerkId() : null;

        // Re-fetch performance on every turn so the AI sees up-to-date data
        // if the candidate solves problems mid-interview (cheap call, graceful-fails)
        CandidatePerformance performance = codingPlatformClient.getPerformance(clerkId);

        String aiText = groqService.generateResponse(interview.getRole(), candidateName, performance, history);

        Message aiMessage = Message.builder()
                .interview(interview)
                .sender(Message.SenderType.AI)
                .content(aiText)
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(aiMessage);

        return SendMessageResponse.ok(aiText);
    }

    public List<MessageDto> getMessagesByInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

        return messageRepository.findByInterviewOrderByTimestampAsc(interview)
                .stream()
                .map(m -> new MessageDto(m.getId(), m.getSender().name(), m.getContent(), m.getTimestamp()))
                .collect(Collectors.toList());
    }
}
