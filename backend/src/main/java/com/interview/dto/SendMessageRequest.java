package com.interview.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Long interviewId;
    private String message;
}
