package com.devmastery.progress.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.util.UUID;

@Entity
@Table(name = "topics")
@Getter
public class TopicInfo {

    @Id
    private UUID id;

    @Column(name = "path_id", nullable = false)
    private UUID pathId;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private Integer level;
}
