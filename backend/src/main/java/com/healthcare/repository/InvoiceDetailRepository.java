package com.healthcare.repository;

import com.healthcare.entity.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, UUID> {

    List<InvoiceDetail> findByInvoice_InvoiceId(UUID invoiceId);
}
