CREATE TABLE problem_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    difficulty_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pattern_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID NOT NULL REFERENCES problem_patterns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50),
    leetcode_url VARCHAR(500),
    starter_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some patterns
INSERT INTO problem_patterns (id, name, slug, description, difficulty_level) VALUES
('00000000-0000-0000-0000-000000000001', 'Sliding Window', 'sliding-window', 'Used to perform an operation on a specific window size of a given array or linked list.', 'Medium'),
('00000000-0000-0000-0000-000000000002', 'Two Pointers', 'two-pointers', 'Used to iterate through an array from both ends or at different speeds.', 'Easy'),
('00000000-0000-0000-0000-000000000003', 'Fast & Slow Pointers', 'fast-slow-pointers', 'A pointer algorithm that uses two pointers moving at different speeds.', 'Medium'),
('00000000-0000-0000-0000-000000000004', 'Merge Intervals', 'merge-intervals', 'Used to handle overlapping intervals.', 'Medium');

-- Seed a problem
INSERT INTO pattern_problems (pattern_id, title, difficulty, leetcode_url, starter_code) VALUES
('00000000-0000-0000-0000-000000000001', 'Maximum Average Subarray I', 'Easy', 'https://leetcode.com/problems/maximum-average-subarray-i/', 'class Solution {\n    public double findMaxAverage(int[] nums, int k) {\n        \n    }\n}');
