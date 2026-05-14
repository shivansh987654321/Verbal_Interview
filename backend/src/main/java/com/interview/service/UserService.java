package com.interview.service;

import com.interview.dto.UserSyncRequest;
import com.interview.model.User;
import com.interview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User syncUser(UserSyncRequest req) {
        return userRepository.findByClerkId(req.getClerkId())
                .map(existing -> {
                    existing.setEmail(req.getEmail());
                    existing.setName(req.getName());
                    existing.setProfileImageUrl(req.getProfileImageUrl());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .clerkId(req.getClerkId())
                                .email(req.getEmail())
                                .name(req.getName())
                                .profileImageUrl(req.getProfileImageUrl())
                                .build()
                ));
    }

    public User findByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found: " + clerkId));
    }

    public Optional<User> findByClerkIdOptional(String clerkId) {
        return userRepository.findByClerkId(clerkId);
    }
}
