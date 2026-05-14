package com.interview.repository;

import com.interview.model.Interview;
import com.interview.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserOrderByStartTimeDesc(User user);
    List<Interview> findByUserAndStatusOrderByStartTimeDesc(User user, Interview.InterviewStatus status);
}
