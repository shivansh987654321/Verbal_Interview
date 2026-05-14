package com.interview.controller;

import com.interview.dto.UserSyncRequest;
import com.interview.model.User;
import com.interview.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<String> syncUser(@RequestBody UserSyncRequest req) {
        userService.syncUser(req);
        return ResponseEntity.ok("User synced successfully");
    }

    @GetMapping("/{clerkId}")
    public ResponseEntity<User> getUser(@PathVariable String clerkId) {
        User user = userService.findByClerkId(clerkId);
        return ResponseEntity.ok(user);
    }
}
