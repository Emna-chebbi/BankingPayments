package tn.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pi.entity.FraudCheckEntity;
import java.util.List;

public interface FraudCheckRepository extends JpaRepository<FraudCheckEntity, Long> {
    FraudCheckEntity findByTransactionId(String transactionId);

    // ADD THIS METHOD for getting all fraud checks ordered by check date
    List<FraudCheckEntity> findAllByOrderByCheckedAtDesc();
}