package com.interview.service;

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

    private final MessageRepository messageRepository;
    private final InterviewRepository interviewRepository;
    private final GroqService groqService;

    @Transactional
    public SendMessageResponse processUserMessage(SendMessageRequest req) {
        Interview interview = interviewRepository.findById(req.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found: " + req.getInterviewId()));

        if (interview.getStatus() != Interview.InterviewStatus.ACTIVE) {
            throw new RuntimeException("Interview is not active");
        }

        // Save user message
        Message userMessage = Message.builder()
                .interview(interview)
                .sender(Message.SenderType.USER)
                .content(req.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(userMessage);

        // Fetch conversation history (for AI context)
        List<Message> history = messageRepository.findByInterviewOrderByTimestampAsc(interview);

        // Generate AI response with full context
        String aiText = groqService.generateResponse(interview.getRole(), history);

        // Save AI response
        Message aiMessage = Message.builder()
                .interview(interview)
                .sender(Message.SenderType.AI)
                .content(aiText)
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(aiMessage);

        return new SendMessageResponse(aiText);
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
