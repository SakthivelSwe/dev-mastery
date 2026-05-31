package com.devmastery.progress.config;

import com.devmastery.progress.event.LearningEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka producer and consumer configuration for DevMastery progress-service.
 *
 * Serialization: JSON via Spring Kafka's JsonSerializer/JsonDeserializer.
 * Trusted packages: com.devmastery.progress.event (LearningEvent).
 *
 * Producer: KafkaTemplate<String, LearningEvent>
 * Consumer: ConcurrentKafkaListenerContainerFactory for @KafkaListener methods
 */
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    // ─── Producer Configuration ───────────────────────────────────────────────

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,   bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,   StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        // Ensure all replicas acknowledge — prevents silent message loss
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        // Retry up to 3 times on transient errors
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // ─── Consumer Configuration ───────────────────────────────────────────────

    @Bean
    public ConsumerFactory<String, LearningEvent> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG,          "analytics-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,   StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        // Only trust our own event package — security best practice
        props.put(JsonDeserializer.TRUSTED_PACKAGES,       "com.devmastery.progress.event");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE,     LearningEvent.class.getName());
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS,  false);
        return new DefaultKafkaConsumerFactory<>(props,
                new StringDeserializer(),
                new JsonDeserializer<>(LearningEvent.class, false));
    }

    /**
     * The ConcurrentKafkaListenerContainerFactory used by @KafkaListener methods.
     * Named "learningEventListenerFactory" to match the containerFactory attribute
     * in AnalyticsEventConsumer.
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, LearningEvent> learningEventListenerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, LearningEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3); // 3 threads matches 3 partitions on high-volume topics
        return factory;
    }
}
