package com.interview.controller;

import com.interview.dto.MessageDto;
import com.interview.dto.SendMessageRequest;
import com.interview.dto.SendMessageResponse;
import com.interview.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<SendMessageResponse> sendMessage(@RequestBody SendMessageRequest req) {
        SendMessageResponse response = messageService.processUserMessage(req);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long interviewId) {
        return ResponseEntity.ok(messageService.getMessagesByInterview(interviewId));
    }
}
