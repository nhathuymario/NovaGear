package uth.nhathuy.Product.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Map;
import java.util.List;
import java.util.Collections;
import java.util.UUID;
import java.io.InputStream;
import java.net.http.HttpRequest.BodyPublisher;
import java.net.http.HttpRequest.BodyPublishers;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceClient {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // In Docker, AI service is accessible via http://ai-service:8000
    // But since there's no ai-service url in environment, we use a fallback if not provided
    @Value("${AI_SERVICE_URL:http://localhost:8000}")
    private String aiServiceUrl;

    @Async
    public void syncProductEmbedding(String productId, String title, String description) {
        try {
            Map<String, String> payload = Map.of(
                    "product_id", productId,
                    "title", title,
                    "description", description == null ? "" : description
            );
            
            String requestBody = objectMapper.writeValueAsString(payload);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/v1/catalog/embeddings"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
                    
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Successfully synced embedding for product: {}", productId);
        } catch (Exception e) {
            log.error("Failed to sync embedding for product {}: {}", productId, e.getMessage());
        }
    }

    public List<String> getSimilarProductIds(String productId, int limit) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/v1/catalog/recommendations/" + productId + "?limit=" + limit))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
                    
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                Map<String, Object> body = objectMapper.readValue(response.body(), Map.class);
                return (List<String>) body.getOrDefault("product_ids", Collections.emptyList());
            }
        } catch (Exception e) {
            log.error("Failed to fetch recommendations for product {}: {}", productId, e.getMessage());
        }
        return Collections.emptyList();
    }

    public byte[] enhanceImage(MultipartFile file) {
        try {
            String boundary = "Boundary-" + UUID.randomUUID().toString();
            byte[] fileBytes = file.getBytes();
            
            // Construct multipart/form-data body
            StringBuilder builder = new StringBuilder();
            builder.append("--").append(boundary).append("\r\n");
            builder.append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(file.getOriginalFilename()).append("\"\r\n");
            builder.append("Content-Type: ").append(file.getContentType()).append("\r\n\r\n");
            
            byte[] header = builder.toString().getBytes("UTF-8");
            byte[] footer = ("\r\n--" + boundary + "--\r\n").getBytes("UTF-8");
            
            byte[] body = new byte[header.length + fileBytes.length + footer.length];
            System.arraycopy(header, 0, body, 0, header.length);
            System.arraycopy(fileBytes, 0, body, header.length, fileBytes.length);
            System.arraycopy(footer, 0, body, header.length + fileBytes.length, footer.length);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/v1/images/enhance"))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(BodyPublishers.ofByteArray(body))
                    .build();
                    
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            
            if (response.statusCode() == 200) {
                return response.body();
            } else {
                log.warn("Enhance image failed with status {}. Returning original bytes.", response.statusCode());
                return file.getBytes();
            }
        } catch (Exception e) {
            log.error("Failed to enhance image, returning original: {}", e.getMessage());
            try {
                return file.getBytes();
            } catch (Exception ignored) {
                return null;
            }
        }
    }
}
