package com.example.fitme.module.authentication.entity;


import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user_profiles")
@Entity
@SuperBuilder
public class UserProfile extends EntityBase {
    
    private String username;

    @Column(unique = true)
    private String cognitoId;

    @Column(unique = true)
    private String email;

    // Optional fields
    private String birthdate;
    private Boolean emailVerified;
    private String gender;
    private String name;
    private String phoneNumber;
    private String picture;

}
