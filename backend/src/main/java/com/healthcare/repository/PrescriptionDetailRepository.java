package com.healthcare.repository;

import com.healthcare.entity.PrescriptionDetail;
import com.healthcare.entity.PrescriptionDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, PrescriptionDetailId> {
}
