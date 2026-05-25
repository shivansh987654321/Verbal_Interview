package com.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageResponse {
    private String aiResponse;
    private boolean terminated;
    private String terminationReason;

    public static SendMessageResponse ok(String aiResponse) {
        return new SendMessageResponse(aiResponse, false, null);
    }

    public static SendMessageResponse terminated(String message, String reason) {
        return new SendMessageResponse(message, true, reason);
    }
}
