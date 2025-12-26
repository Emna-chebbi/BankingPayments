package tn.pi.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_checks")
public class FraudCheckEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "fraud_status")
    private String fraudStatus; // CLEAR, SUSPICIOUS, BLOCKED

    private String reason;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    // Default constructor
    public FraudCheckEntity() {
        this.checkedAt = LocalDateTime.now();
    }

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getFraudStatus() { return fraudStatus; }
    public void setFraudStatus(String fraudStatus) { this.fraudStatus = fraudStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }
}