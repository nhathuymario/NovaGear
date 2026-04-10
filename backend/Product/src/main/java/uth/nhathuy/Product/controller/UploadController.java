package uth.nhathuy.Product.controller;

import uth.nhathuy.Product.dto.UploadResponse;
import uth.nhathuy.Product.service.UploadStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.util.Locale;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadStorageService uploadStorageService;

    @PostMapping("/{folder}")
    public ResponseEntity<UploadResponse> upload(
            @PathVariable String folder,
            @RequestPart("file") MultipartFile file
    ) {
        String storedName = uploadStorageService.save(folder, file);
        String safeFolder = folder.toLowerCase(Locale.ROOT);
        return ResponseEntity.ok(new UploadResponse("/api/uploads/" + safeFolder + "/" + storedName));
    }

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serve(
            @PathVariable String folder,
            @PathVariable String filename
    ) throws Exception {
        Resource resource = uploadStorageService.load(folder, filename);
        String contentType = Files.probeContentType(uploadStorageService.resolveFile(folder, filename));
        MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.noCache())
                .body(resource);
    }
}


