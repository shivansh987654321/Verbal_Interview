package com.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InterviewDto {
    private Long id;
    private String role;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}
