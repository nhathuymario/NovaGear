package uth.nhathuy.Notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import uth.nhathuy.Notification.model.RealtimeEvent;

@Service
@RequiredArgsConstructor
public class RealtimeEventDispatchService {

    private final SimpMessagingTemplate messagingTemplate;

    public void dispatch(RealtimeEvent event) {
        if (event == null || event.eventType() == null) {
            return;
        }

        String eventType = event.eventType();
        messagingTemplate.convertAndSend("/topic/system/events", event);

        if (eventType.startsWith("ORDER_") || eventType.startsWith("PAYMENT_")) {
            messagingTemplate.convertAndSend("/topic/admin/orders", event);
            if (event.userId() != null) {
                messagingTemplate.convertAndSend("/topic/user/orders/" + event.userId(), event);
            }
            return;
        }

        if (eventType.startsWith("INVENTORY_")) {
            messagingTemplate.convertAndSend("/topic/admin/inventory", event);
            if ("INVENTORY_LOW_STOCK".equalsIgnoreCase(eventType)) {
                messagingTemplate.convertAndSend("/topic/admin/inventory/low-stock", event);
            }
        }
    }
}

