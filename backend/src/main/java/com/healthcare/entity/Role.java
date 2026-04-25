package com.healthcare.entity;

public enum Role {
    ADMIN("835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be"),
    DOCTOR("0d8b1eaf613adfeff42e6fc12f168c188a8256fd509ef79c3e214fb0a4687109"),
    PATIENT("0a935ec18ca52f08785c9c17d0160d1d62115348cc808392033fcef3e93c6d5c"),
    STAFF("edeea48516c33a2436c2221f3078e54797d58710dcb3efd0417039d934d53b58");

    private final String dbId;

    Role(String dbId) {
        this.dbId = dbId;
    }

    public String getDbId() {
        return dbId;
    }

    public static Role fromDbId(String dbId) {
        for (Role role : values()) {
            if (role.dbId.equals(dbId)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role_id: " + dbId);
    }
}
