package com.healthcare.repository;

import com.healthcare.entity.Patient;
import com.healthcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    @Query("SELECT p FROM Patient p JOIN FETCH p.user")
    List<Patient> findAllWithUser();

    Optional<Patient> findByUser_Email(String email);
    Optional<Patient> findByUser(User user);
}