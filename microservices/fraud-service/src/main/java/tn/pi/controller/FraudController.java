package tn.pi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.pi.entity.FraudCheckEntity;
import tn.pi.repository.FraudCheckRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class FraudController {

    @Autowired
    private FraudCheckRepository fraudCheckRepository;

    @PostMapping("/fraud-check")
    public Map<String, Object> checkFraud(@RequestBody Map<String, Object> transaction) {
        Double amount = Double.valueOf(transaction.get("amount").toString());
        String fromAccount = transaction.get("fromAccount").toString();
        String transactionId = transaction.get("transactionId").toString();

        // Create fraud check entity
        FraudCheckEntity fraudCheck = new FraudCheckEntity();
        fraudCheck.setTransactionId(transactionId);

        Map<String, Object> response = new HashMap<>();

        // Check blocked accounts FIRST (highest priority)
        if (fromAccount.contains("BLOCKED")) {
            fraudCheck.setFraudStatus("BLOCKED");
            fraudCheck.setReason("Account is blocked");
            response.put("fraudStatus", "BLOCKED");
            response.put("reason", "Account is blocked");
        }
        // Then check large amounts
        else if (amount > 10000) {
            fraudCheck.setFraudStatus("SUSPICIOUS");
            fraudCheck.setReason("Amount exceeds threshold of 10,000");
            response.put("fraudStatus", "SUSPICIOUS");
            response.put("reason", "Amount exceeds threshold");
        }
        else if (amount > 5000) {
            fraudCheck.setFraudStatus("SUSPICIOUS");
            fraudCheck.setReason("Amount requires manual review");
            response.put("fraudStatus", "SUSPICIOUS");
            response.put("reason", "Amount requires manual review");
        }
        // Otherwise clear
        else {
            fraudCheck.setFraudStatus("CLEAR");
            fraudCheck.setReason("No fraud detected");
            response.put("fraudStatus", "CLEAR");
            response.put("reason", "No fraud detected");
        }

        // Save fraud check result
        fraudCheckRepository.save(fraudCheck);

        response.put("transactionId", transactionId);
        response.put("checkedAt", fraudCheck.getCheckedAt());

        return response;
    }

    @GetMapping("/fraud-check/{transactionId}")
    public Map<String, Object> getFraudCheck(@PathVariable String transactionId) {
        FraudCheckEntity fraudCheck = fraudCheckRepository.findByTransactionId(transactionId);

        Map<String, Object> response = new HashMap<>();
        if (fraudCheck != null) {
            response.put("transactionId", fraudCheck.getTransactionId());
            response.put("fraudStatus", fraudCheck.getFraudStatus());
            response.put("reason", fraudCheck.getReason());
            response.put("checkedAt", fraudCheck.getCheckedAt());
        } else {
            response.put("error", "Fraud check not found for transaction");
        }

        return response;
    }

    // ADD THIS METHOD - Get all fraud checks (optional for frontend)
    @GetMapping("/fraud-checks")
    public Map<String, Object> getAllFraudChecks() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<FraudCheckEntity> fraudChecks = fraudCheckRepository.findAllByOrderByCheckedAtDesc();
            response.put("fraudChecks", fraudChecks);
            response.put("count", fraudChecks.size());
            response.put("status", "SUCCESS");
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Failed to fetch fraud checks");
        }
        return response;
    }
}