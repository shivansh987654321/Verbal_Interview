package com.interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.interview.model.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GroqService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateResponse(String role, List<Message> conversationHistory) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 500);

            ArrayNode messages = objectMapper.createArrayNode();

            // System prompt
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content", buildSystemPrompt(role));
            messages.add(systemMessage);

            // Conversation history
            for (Message msg : conversationHistory) {
                ObjectNode m = objectMapper.createObjectNode();
                m.put("role", msg.getSender() == Message.SenderType.AI ? "assistant" : "user");
                m.put("content", msg.getContent());
                messages.add(m);
            }

            requestBody.set("messages", messages);

            String responseBody = webClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseNode = objectMapper.readTree(responseBody);
            return responseNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText("I'm having trouble generating a response. Please try again.");

        } catch (Exception e) {
            throw new RuntimeException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    private String buildSystemPrompt(String role) {
        String roleContext = getRoleContext(role);
        return """
                You are an experienced senior software engineer conducting a mock technical interview for a fresher \
                applying for a %s position. This is a realistic, professional interview simulation.

                STRICT RULES — follow these exactly:
                1. Ask ONLY ONE question per response. Never ask multiple questions at once.
                2. Start the interview with a brief, warm professional greeting and one warm-up question.
                3. After the candidate answers, acknowledge their response briefly (1 sentence), \
                   then ask the NEXT question or a follow-up if they were incomplete.
                4. Adapt difficulty based on the quality of answers — start easy, progress gradually.
                5. Cover these topics for this role: %s
                6. Ask follow-up questions when an answer is vague or incomplete.
                7. If the candidate is completely stuck, provide a small hint after they express difficulty.
                8. Do NOT reveal scores, grades, or evaluation at any point during the interview.
                9. Keep your responses concise — maximum 3-4 sentences total per turn.
                10. Maintain a professional, encouraging, and neutral tone throughout.
                11. After 8-10 questions, naturally wrap up the interview with a professional closing.

                Remember: You are simulating a real interview. Stay in character at all times.
                """.formatted(getRoleLabel(role), roleContext);
    }

    private String getRoleContext(String role) {
        return switch (role) {
            case "java-developer" ->
                    "Core Java (OOP, Collections, Generics, Exception Handling), Multithreading, " +
                    "JVM internals, Spring Boot basics, JDBC, design patterns, SOLID principles";
            case "frontend-developer" ->
                    "HTML5, CSS3, JavaScript (ES6+), DOM manipulation, Event handling, " +
                    "React.js fundamentals, Browser APIs, Web performance, Responsive design";
            case "full-stack" ->
                    "Frontend (HTML/CSS/JS/React), Backend (REST APIs, Spring Boot), " +
                    "Databases (SQL/NoSQL), HTTP protocol, Authentication, System design basics";
            case "dsa-interview" ->
                    "Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Graphs, " +
                    "Sorting, Searching, Dynamic Programming, Recursion, Time/Space complexity";
            case "hr-round" ->
                    "Tell me about yourself, Strengths and weaknesses, Why this company, " +
                    "Career goals, Teamwork and conflict resolution, Situational questions, " +
                    "Salary expectations, Notice period";
            case "cs-fundamentals" ->
                    "Operating Systems (processes, threads, deadlock, memory management), " +
                    "DBMS (normalization, SQL, transactions, indexing), " +
                    "Computer Networks (OSI model, TCP/IP, HTTP, DNS), " +
                    "OOP concepts, Software engineering basics";
            default ->
                    "Software engineering fundamentals, data structures, algorithms, " +
                    "system design, problem-solving, communication skills";
        };
    }

    private String getRoleLabel(String role) {
        return switch (role) {
            case "java-developer" -> "Java Developer";
            case "frontend-developer" -> "Frontend Developer";
            case "full-stack" -> "Full Stack Developer";
            case "dsa-interview" -> "Software Engineer (DSA focus)";
            case "hr-round" -> "Software Engineer (HR Round)";
            case "cs-fundamentals" -> "Software Engineer (CS Fundamentals)";
            default -> "Software Developer";
        };
    }
}
