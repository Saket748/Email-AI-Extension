package com.email.email_writer.controller;

import com.email.email_writer.EmailRequest;
import com.email.email_writer.service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "https://mail.google.com")
@RestController
@RequestMapping("api/email")
public class EmailGeneratorCobtroller {

    @Autowired
    private EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest){
        String response = emailGeneratorService.genrateEmailReply(emailRequest);
        return ResponseEntity.ok(response);
    }

}
