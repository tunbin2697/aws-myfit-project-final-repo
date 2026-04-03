package com.example.fitme.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AwsS3Config {

    @Value("${cloud.aws.credentials.access-key:}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key:}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public AmazonS3 getAmazonS3Client() {
        AmazonS3ClientBuilder builder = AmazonS3ClientBuilder.standard()
                .withRegion(region);

        if (!accessKey.isBlank() && !secretKey.isBlank()) {
            AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            builder.withCredentials(new AWSStaticCredentialsProvider(credentials));
        } else {
            builder.withCredentials(DefaultAWSCredentialsProviderChain.getInstance());
        }

        return builder.build();
    }
}
