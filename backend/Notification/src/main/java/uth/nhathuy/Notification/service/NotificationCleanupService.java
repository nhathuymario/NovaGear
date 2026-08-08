package uth.nhathuy.Notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationCleanupService {

    private final NotificationPersistenceService persistenceService;

    @Value("${notification.retention-days:365}")
    private int retentionDays;

    // Run daily at 03:00
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldNotifications() {
        try {
            long deleted = persistenceService.cleanupOlderThanDays(retentionDays);
            log.info("Notification cleanup completed. Deleted {} records older than {} days.", deleted, retentionDays);
        } catch (Exception ex) {
            log.warn("Notification cleanup failed", ex);
        }
    }
}

