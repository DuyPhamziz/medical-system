package com.healthcare.security;

import java.util.UUID;

/**
 * ThreadLocal holder for current tenant context (organization ID).
 * Populated by TenantContextFilter from JWT claims.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_ORG = new ThreadLocal<>();

    private TenantContext() {}

    public static void setOrgId(UUID orgId) {
        CURRENT_ORG.set(orgId);
    }

    public static UUID getOrgId() {
        return CURRENT_ORG.get();
    }

    public static void clear() {
        CURRENT_ORG.remove();
    }
}
