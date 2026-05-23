package com.healthcare.service;

import com.healthcare.dto.CreateInvoiceRequest;
import com.healthcare.dto.InvoiceResponse;
import com.healthcare.entity.Invoice;
import com.healthcare.entity.InvoiceDetail;
import com.healthcare.repository.InvoiceDetailRepository;
import com.healthcare.repository.InvoiceRepository;
import com.healthcare.repository.ServiceRepository;
import com.healthcare.repository.VisitRepository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceDetailRepository invoiceDetailRepository;
    private final ServiceRepository serviceRepository;
    private final VisitRepository visitRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          InvoiceDetailRepository invoiceDetailRepository,
                          ServiceRepository serviceRepository,
                          VisitRepository visitRepository) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceDetailRepository = invoiceDetailRepository;
        this.serviceRepository = serviceRepository;
        this.visitRepository = visitRepository;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByVisit(UUID visitId) {
        return invoiceRepository.findByVisit_VisitId(visitId).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UUID invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
    }

    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
        com.healthcare.entity.Visit visit = visitRepository.findById(request.getVisitId())
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        Invoice invoice = Invoice.builder()
                .visit(visit)
                .totalAmount(BigDecimal.ZERO)
                .status("PENDING")
                .build();
        Invoice savedInvoice = invoiceRepository.save(invoice);

        BigDecimal total = BigDecimal.ZERO;
        List<InvoiceDetail> details = new ArrayList<>();
        for (CreateInvoiceRequest.InvoiceItem item : request.getItems()) {
            com.healthcare.entity.Service service = serviceRepository.findById(item.getServiceId())
                    .orElseThrow(() -> new IllegalArgumentException("Service not found: " + item.getServiceId()));

            // Use DB price, only fall back to client price if DB price is null
            BigDecimal unitPrice = service.getPrice() != null ? service.getPrice() : item.getUnitPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(lineTotal);

            InvoiceDetail detail = InvoiceDetail.builder()
                    .invoice(savedInvoice)
                    .service(service)
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
            details.add(detail);
        }
        invoiceDetailRepository.saveAll(details);

        savedInvoice.setTotalAmount(total);
        invoiceRepository.save(savedInvoice);

        return toResponse(savedInvoice);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<InvoiceResponse.InvoiceDetailDTO> details = invoiceDetailRepository
                .findByInvoice_InvoiceId(invoice.getInvoiceId()).stream()
                .map(d -> InvoiceResponse.InvoiceDetailDTO.builder()
                        .detailId(d.getDetailId())
                        .serviceId(d.getService().getServiceId())
                        .serviceName(d.getService().getName())
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .totalPrice(d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return InvoiceResponse.builder()
                .invoiceId(invoice.getInvoiceId())
                .visitId(invoice.getVisit().getVisitId())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .details(details)
                .build();
    }
}
