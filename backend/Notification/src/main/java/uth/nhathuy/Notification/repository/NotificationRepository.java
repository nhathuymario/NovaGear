package uth.nhathuy.Notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uth.nhathuy.Notification.model.NotificationEntity;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    Page<NotificationEntity> findByUserIdOrderByOccurredAtDesc(Long userId, Pageable pageable);

    Page<NotificationEntity> findByEventTypeStartingWithOrderByOccurredAtDesc(String prefix, Pageable pageable);

    Page<NotificationEntity> findByUserIdAndEventTypeStartingWithOrderByOccurredAtDesc(Long userId, String prefix, Pageable pageable);

    long deleteByCreatedAtBefore(java.time.Instant cutoff);
}


