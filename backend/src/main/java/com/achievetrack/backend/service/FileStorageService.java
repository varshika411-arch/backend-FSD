package com.achievetrack.backend.service;

import com.achievetrack.backend.exception.ApiException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void initialize() {
        try {
            uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to initialize upload directory");
        }
    }

    public String storeAchievementEvidence(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (!ALLOWED_MIME_TYPES.contains(file.getContentType())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file type. Only PDF, JPG, PNG, DOC, and DOCX are allowed"
            );
        }

        String originalName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "file";
        String safeName = originalName.replaceAll("\\s+", "-").replaceAll("[^a-zA-Z0-9._-]", "");
        if (!StringUtils.hasText(safeName)) {
            safeName = "file";
        }

        String storedName = System.currentTimeMillis() + "-" + safeName;

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, uploadPath.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
        }

        return "/uploads/" + storedName;
    }
}
