-- PostgreSQL initialization script
-- Creates the judge0 database alongside the main devmastery database

-- Create judge0 database for Judge0 CE self-hosted code execution
CREATE DATABASE judge0;

-- Create devmastery_ai database for Mock Interview transcripts and AI data
CREATE DATABASE devmastery_ai;

-- Grant all privileges to the devmastery user
GRANT ALL PRIVILEGES ON DATABASE judge0 TO devmastery;
GRANT ALL PRIVILEGES ON DATABASE devmastery TO devmastery;
GRANT ALL PRIVILEGES ON DATABASE devmastery_ai TO devmastery;
