package com.healthcare.dto;

import com.healthcare.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private UUID roomId;
    private String name;
    private String type;
    private UUID clinicId;

    public static RoomResponse fromEntity(Room room) {
        return RoomResponse.builder()
                .roomId(room.getRoomId())
                .name(room.getName())
                .type(room.getType())
                .clinicId(room.getClinic() != null ? room.getClinic().getClinicId() : null)
                .build();
    }
}
