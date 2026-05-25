package com.interview.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String role;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewStatus status;

    @Column(name = "termination_reason", length = 255)
    private String terminationReason;

    @Column(name = "terminated_at")
    private LocalDateTime terminatedAt;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, fetch = FetchType.LAZY,
               orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<Message> messages;

    @PrePersist
    protected void onCreate() {
        startTime = LocalDateTime.now();
        if (status == null) status = InterviewStatus.ACTIVE;
    }

    public enum InterviewStatus {
        ACTIVE, COMPLETED, ABANDONED, TERMINATED
    }
}
