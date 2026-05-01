package com.healthcare.repository;

import com.healthcare.entity.Patient;
import com.healthcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUser_Email(String email);
    Optional<Patient> findByUser(User user);
}