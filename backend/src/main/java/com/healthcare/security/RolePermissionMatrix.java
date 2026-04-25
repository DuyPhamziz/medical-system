package com.healthcare.security;

import com.healthcare.entity.Permission;
import com.healthcare.entity.Role;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public final class RolePermissionMatrix {

    private static final Map<Role, Set<Permission>> MATRIX = new EnumMap<>(Role.class);

    static {
        MATRIX.put(Role.ADMIN, EnumSet.of(
                Permission.USER_MANAGE,
                Permission.ROLE_ASSIGN,
                Permission.SYSTEM_CONFIG_READ,
                Permission.PATIENT_READ,
                Permission.VISIT_MANAGE,
                Permission.DIAGNOSIS_WRITE,
                Permission.APPOINTMENT_READ_SELF,
                Permission.MEDICAL_RECORD_READ_SELF
        ));
        MATRIX.put(Role.DOCTOR, EnumSet.of(
                Permission.PATIENT_READ,
                Permission.VISIT_MANAGE,
                Permission.DIAGNOSIS_WRITE
        ));
        MATRIX.put(Role.STAFF, EnumSet.of(
                Permission.PATIENT_READ,
                Permission.VISIT_MANAGE
        ));
        MATRIX.put(Role.PATIENT, EnumSet.of(
                Permission.APPOINTMENT_READ_SELF,
                Permission.MEDICAL_RECORD_READ_SELF
        ));
    }

    private RolePermissionMatrix() {
    }

    public static Set<Permission> permissionsOf(Role role) {
        return MATRIX.getOrDefault(role, EnumSet.noneOf(Permission.class));
    }
}
