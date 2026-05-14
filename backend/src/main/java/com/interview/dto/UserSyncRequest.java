package com.interview.dto;

import lombok.Data;

@Data
public class UserSyncRequest {
    private String clerkId;
    private String email;
    private String name;
    private String profileImageUrl;
}
