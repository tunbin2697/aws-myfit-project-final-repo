package com.example.fitme.module.testing_template.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*") 
@RequiredArgsConstructor
public class TestController {

    // private final TestService userService;

    @GetMapping("/private")
    public ResponseEntity<String> health(
            @RequestParam(defaultValue = "ok") String test,
            Principal principal
    ) {
        // Demonstrate that we know who the user is from the token
        String username = (principal != null) ? principal.getName() : "Unknown";
        return ResponseEntity.ok(test + " - Authorized access for user: " + username);
    }

    @GetMapping("/health")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("This is a public endpoint. Anyone can see this without a token.");
    }

    // @PostMapping
    // public TestResponseDTO create(
    //         @RequestBody @Valid TestCreateRequestDTO request
    // ) {
    //     return userService.createUser(request);
    // }

    // @GetMapping("/{id}")
    // public TestResponseDTO getById(@PathVariable UUID id) {
    //     return userService.getUsersById(id);
    // }

    // @GetMapping
    // public List<TestResponseDTO> getAll() {
    //     return userService.getAllUsers();
    // }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> delete(@PathVariable UUID id) {
    //     userService.deleteUser(id);
    //     return ResponseEntity.noContent().build();
    // }
}
