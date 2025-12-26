package tn.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pi.entity.NotificationEntity;
import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByTransactionId(String transactionId);

    // ADD THIS METHOD for getting all notifications ordered by sent date
    List<NotificationEntity> findAllByOrderBySentAtDesc();
}