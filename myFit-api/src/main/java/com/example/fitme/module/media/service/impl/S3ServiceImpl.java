package com.example.fitme.module.media.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.example.fitme.module.media.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3ServiceImpl implements S3Service {

    private final AmazonS3 amazonS3;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Value("${cloudfront.domain}")
    private String cloudfrontDomain;

    @Override
    public String uploadImageFromUrl(String sourceUrl, String folderName) {
        try {
            log.info("Downloading image from Unsplash: {}", sourceUrl);
            URL url = new URL(sourceUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            // Unsplash occasionally requires a User-Agent to prevent 403s
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.error("Failed to download image from {} - HTTP Response Code: {}", sourceUrl, responseCode);
                return null;
            }

            String contentType = connection.getContentType();
            String extension = ".jpg";
            if (contentType != null && contentType.contains("png")) extension = ".png";

            String fileName = folderName + "/" + UUID.randomUUID().toString() + extension;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(contentType != null ? contentType : "image/jpeg");
            metadata.setContentLength(connection.getContentLengthLong());

            try (InputStream inputStream = connection.getInputStream()) {
                log.info("Uploading image to S3 bucket {} at key {}", bucketName, fileName);
                PutObjectRequest request = new PutObjectRequest(bucketName, fileName, inputStream, metadata);
                amazonS3.putObject(request);
                
                String cfUrl = "https://" + cloudfrontDomain + "/" + fileName;
                log.info("Successfully uploaded image to S3, returning CloudFront URL: {}", cfUrl);
                return cfUrl;
            }
        } catch (Exception e) {
            log.error("Error encountered while processing image upload from {}: {}", sourceUrl, e.getMessage(), e);
            return null;
        }
    }
}
