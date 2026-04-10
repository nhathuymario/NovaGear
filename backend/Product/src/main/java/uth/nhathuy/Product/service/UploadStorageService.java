package uth.nhathuy.Product.service;

import uth.nhathuy.Product.exception.BadRequestException;
import uth.nhathuy.Product.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class UploadStorageService {

    private static final Set<String> ALLOWED_FOLDERS = Set.of("products", "avatars");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");
    private final Path rootDir = Paths.get("uploads").toAbsolutePath().normalize();

    public String save(String folder, MultipartFile file) {
        String safeFolder = resolveFolder(folder);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File upload không hợp lệ");
        }

        try {
            Files.createDirectories(rootDir.resolve(safeFolder));

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
            String extension = getExtension(originalName);
            validateImage(file, extension);
            String storedName = UUID.randomUUID() + extension;
            Path target = rootDir.resolve(safeFolder).resolve(storedName).normalize();

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Saved upload file to {}", target);
            return storedName;
        } catch (IOException ex) {
            throw new BadRequestException("Không thể lưu file upload: " + ex.getMessage());
        }
    }

    public Resource load(String folder, String filename) {
        String safeFolder = resolveFolder(folder);
        Path filePath = rootDir.resolve(safeFolder).resolve(filename).normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Không tìm thấy file upload");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new BadRequestException("Đường dẫn file upload không hợp lệ");
        }
    }

    public Path resolveFile(String folder, String filename) {
        String safeFolder = resolveFolder(folder);
        return rootDir.resolve(safeFolder).resolve(filename).normalize();
    }

    private String resolveFolder(String folder) {
        String safeFolder = folder == null ? "" : folder.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_FOLDERS.contains(safeFolder)) {
            throw new BadRequestException("Loại upload không được hỗ trợ");
        }
        return safeFolder;
    }

    private String getExtension(String originalName) {
        if (!StringUtils.hasText(originalName) || !originalName.contains(".")) {
            return "";
        }

        String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        if (ext.length() > 10) {
            return "";
        }
        return ext;
    }

    private void validateImage(MultipartFile file, String extension) {
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/")) {
            throw new BadRequestException("File upload phải là ảnh (JPG, JPEG, PNG, WEBP, GIF)");
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Định dạng ảnh không hỗ trợ. Chỉ hỗ trợ JPG, JPEG, PNG, WEBP, GIF");
        }
    }
}

