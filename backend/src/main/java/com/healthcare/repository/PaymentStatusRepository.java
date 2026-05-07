package com.healthcare.repository;

import com.healthcare.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentStatusRepository extends JpaRepository<PaymentStatus, UUID> {

    List<PaymentStatus> findAll();
}
