package uth.nhathuy.Notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uth.nhathuy.Notification.model.RealtimeEvent;
import uth.nhathuy.Notification.service.RealtimeEventDispatchService;

@RestController
@RequestMapping("/api/notifications/events")
@RequiredArgsConstructor
public class NotificationEventController {

    private final RealtimeEventDispatchService dispatchService;

    @PostMapping
    public ResponseEntity<Void> publish(@RequestBody RealtimeEvent event) {
        dispatchService.dispatch(event);
        return ResponseEntity.accepted().build();
    }
}

