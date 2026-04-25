package com.healthcare.dto;

import com.healthcare.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AssignRoleRequest {
    @NotNull
    private UUID userId;

    @NotNull
    private Role role;
}
