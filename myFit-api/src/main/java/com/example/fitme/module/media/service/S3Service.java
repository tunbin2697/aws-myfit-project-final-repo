package com.example.fitme.module.media.service;


public interface S3Service {
    String uploadImageFromUrl(String sourceUrl, String folderName);
}
