package tn.pi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.pi.entity.NotificationEntity;
import tn.pi.repository.NotificationRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping("/notify/customer")
    public Map<String, Object> notifyCustomer(@RequestBody Map<String, Object> notification) {
        return saveNotification(notification, "CUSTOMER");
    }

    @PostMapping("/notify/compliance")
    public Map<String, Object> notifyCompliance(@RequestBody Map<String, Object> notification) {
        return saveNotification(notification, "COMPLIANCE");
    }

    @PostMapping("/notify/ledger")
    public Map<String, Object> notifyLedger(@RequestBody Map<String, Object> notification) {
        return saveNotification(notification, "LEDGER");
    }

    private Map<String, Object> saveNotification(Map<String, Object> notification, String type) {
        NotificationEntity notificationEntity = new NotificationEntity();
        notificationEntity.setTransactionId(notification.get("transactionId").toString());
        notificationEntity.setNotificationType(type);
        notificationEntity.setStatus("SENT");
        notificationEntity.setMessage(notification.get("message").toString());

        notificationRepository.save(notificationEntity);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SENT");
        response.put("type", type);
        response.put("transactionId", notificationEntity.getTransactionId());
        response.put("message", "Notification sent successfully");

        return response;
    }

    @GetMapping("/notifications/{transactionId}")
    public Map<String, Object> getNotifications(@PathVariable String transactionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationEntity> notifications = notificationRepository.findByTransactionId(transactionId);
            response.put("transactionId", transactionId);
            response.put("notifications", notifications);
            response.put("count", notifications.size());
        } catch (Exception e) {
            response.put("error", "Failed to fetch notifications");
        }
        return response;
    }

    // ADD THIS METHOD - Get all notifications (for frontend dashboard)
    @GetMapping("/notifications")
    public Map<String, Object> getAllNotifications() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationEntity> notifications = notificationRepository.findAllByOrderBySentAtDesc();
            response.put("notifications", notifications);
            response.put("count", notifications.size());
            response.put("status", "SUCCESS");
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Failed to fetch notifications");
        }
        return response;
    }
}