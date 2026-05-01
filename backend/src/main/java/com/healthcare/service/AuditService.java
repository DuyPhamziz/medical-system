package com.healthcare.service;

import com.healthcare.entity.AuditLog;
import com.healthcare.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void logAction(String action, String resourceType, String resourceId, String details) {
        String ipAddress = "unknown";
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ipAddress = request.getRemoteAddr();
        }

        AuditLog log = AuditLog.builder()
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(log);
    }
}
