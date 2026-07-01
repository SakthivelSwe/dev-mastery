const fs = require('fs');
const path = require('path');

const CONTENT_DIR = 'C:\\AI projects\\dev-mastery\\apps\\web\\content\\microservices';

const topics = {
  'ms-versioning': {
    title: 'Versioning APIs',
    slug: 'ms-versioning',
    level: 3,
  },
  'ms-inter-service-comm': {
    title: 'Synchronous Inter-Service Calls',
    slug: 'ms-inter-service-comm',
    level: 3,
  },
  'ms-event-driven': {
    title: 'Event-Driven Architecture (Kafka)',
    slug: 'ms-event-driven',
    level: 3,
  },
  'ms-config-server': {
    title: 'Centralised Config (Spring Cloud Config)',
    slug: 'ms-config-server',
    level: 3,
  },
  'ms-service-discovery': {
    title: 'Service Discovery (Eureka)',
    slug: 'ms-service-discovery',
    level: 3,
  },
  'ms-api-gateway': {
    title: 'API Gateway (Spring Cloud Gateway)',
    slug: 'ms-api-gateway',
    level: 3,
  },
  'ms-circuit-breaker': {
    title: 'Circuit Breaker (Resilience4j)',
    slug: 'ms-circuit-breaker',
    level: 3,
  },
  'ms-distributed-tx': {
    title: 'Distributed Transactions',
    slug: 'ms-distributed-tx',
    level: 3,
  },
  'ms-saga-pattern': {
    title: 'Saga Pattern',
    slug: 'ms-saga-pattern',
    level: 3,
  },
  'ms-outbox-pattern': {
    title: 'Transactional Outbox Pattern',
    slug: 'ms-outbox-pattern',
    level: 3,
  },
  'ms-cqrs': {
    title: 'CQRS and Event Sourcing',
    slug: 'ms-cqrs',
    level: 3,
  },
  'ms-distributed-tracing': {
    title: 'Distributed Tracing (Sleuth + Zipkin)',
    slug: 'ms-distributed-tracing',
    level: 3,
  },
  'ms-observability': {
    title: 'Observability (Prometheus + Grafana)',
    slug: 'ms-observability',
    level: 3,
  },
  'ms-centralised-logging': {
    title: 'Centralised Logging (ELK stack)',
    slug: 'ms-centralised-logging',
    level: 3,
  },
  'ms-k8s': {
    title: 'Kubernetes for Microservices',
    slug: 'ms-k8s',
    level: 3,
  },
  'ms-service-mesh': {
    title: 'Service Mesh (Istio / Linkerd)',
    slug: 'ms-service-mesh',
    level: 3,
  },
};

// Check which already exist
const existing = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx',''));
const missing = Object.keys(topics).filter(t => !existing.includes(t));
console.log('Already created:', existing.length);
console.log('Missing:', missing);

