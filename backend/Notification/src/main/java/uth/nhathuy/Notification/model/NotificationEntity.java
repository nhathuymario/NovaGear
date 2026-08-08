package uth.nhathuy.Notification.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The target user for this notification. Null for system / admin targets.
    private Long userId;

    private String eventType;

    private String source;

    private String entityId;

    private Instant occurredAt;

    private String traceId;

    @Column(columnDefinition = "text")
    private String payloadJson;

    private boolean readFlag;

    private Instant createdAt;
}

