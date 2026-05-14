package com.interview.repository;

import com.interview.model.Interview;
import com.interview.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByInterviewOrderByTimestampAsc(Interview interview);
    long countByInterview(Interview interview);
}
