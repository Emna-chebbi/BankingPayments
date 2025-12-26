package tn.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pi.entity.TransactionEntity;
import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    TransactionEntity findByTransactionId(String transactionId);

    // ADD THIS METHOD for getting all transactions ordered by creation date
    List<TransactionEntity> findAllByOrderByCreatedAtDesc();
}