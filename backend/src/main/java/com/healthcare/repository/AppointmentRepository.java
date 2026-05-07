package com.healthcare.repository;

import com.healthcare.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByDoctor_UserIdOrderByStartTimeAsc(UUID doctorId);

    List<Appointment> findByPatient_PatientIdOrderByStartTimeDesc(UUID patientId);

    List<Appointment> findByStatus(String status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.userId = :doctorId " +
           "AND a.startTime >= :from AND a.startTime < :to ORDER BY a.startTime ASC")
    List<Appointment> findByDoctorAndDateRange(
            @Param("doctorId") UUID doctorId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT a FROM Appointment a WHERE a.startTime >= :from AND a.startTime < :to ORDER BY a.startTime ASC")
    List<Appointment> findByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.userId = :doctorId " +
           "AND a.status <> 'CANCELLED' " +
           "AND a.startTime < :endTime AND a.endTime > :startTime")
    boolean existsOverlappingAppointment(
            @Param("doctorId") UUID doctorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
