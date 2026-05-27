CREATE TABLE system_design_architectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    difficulty VARCHAR(50),
    mermaid_diagram TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE architecture_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    architecture_id UUID NOT NULL REFERENCES system_design_architectures(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some reference architectures
INSERT INTO system_design_architectures (id, title, slug, description, difficulty, mermaid_diagram) VALUES
('00000000-0000-0000-0000-000000000101', 'URL Shortener (e.g., TinyURL)', 'url-shortener', 'A scalable service that creates short aliases for long URLs.', 'Medium', 
'graph TD
    User-->|Paste long URL|Web_Server
    Web_Server-->|Generate short URL|App_Server
    App_Server-->|Cache check|Valkey_Cache
    App_Server-->|Store mapping|DB[(PostgreSQL)]
    App_Server-->|Counter|Zookeeper'
),
('00000000-0000-0000-0000-000000000102', 'Twitter / X', 'twitter', 'A global microblogging system handling massive read loads.', 'Hard',
'graph TD
    User-->|Post Tweet|API_Gateway
    API_Gateway-->|Write Service|Write_API
    Write_API-->|Store|Tweet_DB[(Cassandra)]
    Write_API-->|Fanout Service|Fanout
    Fanout-->|Push to followers|Valkey_Timeline_Cache
    User_Reader-->|Read Timeline|Read_API
    Read_API-->Valkey_Timeline_Cache'
),
('00000000-0000-0000-0000-000000000103', 'Uber / Ride Sharing', 'uber', 'Geospatial matching of riders to drivers in real time.', 'Hard',
'graph TD
    Rider-->|Request Ride|API_Gateway
    Driver-->|Location Update|WebSocket_Gateway
    WebSocket_Gateway-->Location_Service
    Location_Service-->|Geospatial Index|QuadTree_DB
    API_Gateway-->Matching_Service
    Matching_Service-->QuadTree_DB
    Matching_Service-->|Notify Driver|WebSocket_Gateway'
);
