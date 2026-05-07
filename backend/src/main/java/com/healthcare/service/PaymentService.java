package com.healthcare.service;

import com.healthcare.dto.CreatePaymentRequest;
import com.healthcare.dto.PaymentResponse;
import com.healthcare.entity.Payment;
import com.healthcare.entity.PaymentMethod;
import com.healthcare.entity.PaymentStatus;
import com.healthcare.entity.User;
import com.healthcare.repository.PaymentMethodRepository;
import com.healthcare.repository.PaymentRepository;
import com.healthcare.repository.PaymentStatusRepository;
import com.healthcare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentStatusRepository paymentStatusRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          PaymentMethodRepository paymentMethodRepository,
                          PaymentStatusRepository paymentStatusRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.paymentStatusRepository = paymentStatusRepository;
    }

    @Transactional
    public PaymentResponse processPayment(CreatePaymentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

        PaymentMethod method = null;
        if (request.getMethodId() != null) {
            method = paymentMethodRepository.findById(request.getMethodId())
                    .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + request.getMethodId()));
        }

        PaymentStatus defaultStatus = paymentStatusRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        Payment payment = Payment.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .user(user)
                .method(method)
                .status(defaultStatus)
                .build();

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentHistory(UUID userId) {
        return paymentRepository.findByUser_UserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .description(payment.getDescription())
                .expiryDate(payment.getExpiryDate())
                .planType(payment.getPlanType())
                .createdAt(payment.getCreatedAt())
                .userId(payment.getUser() != null ? payment.getUser().getUserId() : null)
                .userName(payment.getUser() != null ? payment.getUser().getFullName() : null)
                .statusId(payment.getStatus() != null ? payment.getStatus().getStatusId() : null)
                .statusName(payment.getStatus() != null ? payment.getStatus().getName() : null)
                .methodId(payment.getMethod() != null ? payment.getMethod().getMethodId() : null)
                .methodName(payment.getMethod() != null ? payment.getMethod().getName() : null)
                .build();
    }
}
