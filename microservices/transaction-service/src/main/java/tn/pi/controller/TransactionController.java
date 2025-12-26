package tn.pi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.pi.entity.TransactionEntity;
import tn.pi.repository.TransactionRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    // GET ALL TRANSACTIONS - This is what your React app needs!
    @GetMapping("/transactions")
    public Map<String, Object> getAllTransactions() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<TransactionEntity> transactions = transactionRepository.findAllByOrderByCreatedAtDesc();
            response.put("transactions", transactions);
            response.put("count", transactions.size());
            response.put("status", "SUCCESS");
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Failed to fetch transactions: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/transactions")
    public Map<String, Object> createTransaction(@RequestBody Map<String, Object> request) {
        // Create transaction entity
        TransactionEntity transaction = new TransactionEntity();
        transaction.setTransactionId("tx-" + UUID.randomUUID().toString());
        transaction.setAmount(Double.valueOf(request.get("amount").toString()));
        transaction.setCurrency(request.get("currency") != null ?
                request.get("currency").toString() : "USD");
        transaction.setFromAccount(request.get("fromAccount").toString());
        transaction.setToAccount(request.get("toAccount").toString());

        // FIX: Set status based on business rules
        String fromAccount = request.get("fromAccount").toString().toUpperCase();
        double amount = Double.valueOf(request.get("amount").toString());

        if (fromAccount.contains("BLOCKED")) {
            transaction.setStatus("BLOCKED");
        } else if (amount > 5000) {
            transaction.setStatus("PENDING");
        } else {
            transaction.setStatus("COMPLETED");
        }

        // Save to database
        TransactionEntity savedTransaction = transactionRepository.save(transaction);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", savedTransaction.getTransactionId());
        response.put("status", savedTransaction.getStatus());
        response.put("amount", savedTransaction.getAmount());
        response.put("currency", savedTransaction.getCurrency());
        response.put("fromAccount", savedTransaction.getFromAccount());
        response.put("toAccount", savedTransaction.getToAccount());
        response.put("createdAt", savedTransaction.getCreatedAt());

        return response;
    }

    @GetMapping("/transactions/{transactionId}")
    public Map<String, Object> getTransaction(@PathVariable String transactionId) {
        TransactionEntity transaction = transactionRepository.findByTransactionId(transactionId);

        Map<String, Object> response = new HashMap<>();
        if (transaction != null) {
            response.put("transactionId", transaction.getTransactionId());
            response.put("status", transaction.getStatus());
            response.put("amount", transaction.getAmount());
            response.put("currency", transaction.getCurrency());
            response.put("fromAccount", transaction.getFromAccount());
            response.put("toAccount", transaction.getToAccount());
            response.put("createdAt", transaction.getCreatedAt());
            response.put("updatedAt", transaction.getUpdatedAt());
        } else {
            response.put("error", "Transaction not found");
        }

        return response;
    }

    @PutMapping("/transactions/{transactionId}/status")
    public Map<String, Object> updateTransactionStatus(
            @PathVariable String transactionId,
            @RequestBody Map<String, String> statusRequest) {

        TransactionEntity transaction = transactionRepository.findByTransactionId(transactionId);
        Map<String, Object> response = new HashMap<>();

        if (transaction != null) {
            transaction.setStatus(statusRequest.get("status"));
            transactionRepository.save(transaction);

            response.put("transactionId", transaction.getTransactionId());
            response.put("status", transaction.getStatus());
            response.put("message", "Status updated successfully");
        } else {
            response.put("error", "Transaction not found");
        }

        return response;
    }
}