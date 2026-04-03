package com.example.fitme;

import org.flywaydb.core.Flyway;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FitMeApplication {

    public static void main(String[] args) {
        if (isMigrationOnlyMode(args)) {
            runMigrationsOnly();
            return;
        }

        SpringApplication app = new SpringApplication(FitMeApplication.class);
        app.run(args);
    }

    private static boolean isMigrationOnlyMode(String[] args) {
        for (String arg : args) {
            if ("--run.migration=true".equalsIgnoreCase(arg) || "run.migration=true".equalsIgnoreCase(arg)) {
                return true;
            }
        }
        return false;
    }

    private static void runMigrationsOnly() {
        String dbUrl = getRequiredEnv("DB_URL");
        String dbUsername = getRequiredEnv("DB_USERNAME");
        String dbPassword = getRequiredEnv("DB_PASSWORD");

        Flyway flyway = Flyway.configure()
                .dataSource(dbUrl, dbUsername, dbPassword)
                .locations("classpath:db/migration")
                .load();

        flyway.migrate();
    }

    private static String getRequiredEnv(String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required environment variable for migration mode: " + key);
        }
        return value;
    }

}
