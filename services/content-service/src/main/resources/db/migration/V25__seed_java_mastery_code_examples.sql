-- =========================================================================
-- V25: Seed Simple Java Mastery Code Examples
-- =========================================================================

DO $$
BEGIN

  ---------------------------------------------------------
  -- Java Intro
  ---------------------------------------------------------
  INSERT INTO code_examples (id, topic_slug, difficulty_tier, title, language, code, time_complexity, space_complexity, is_runnable)
  VALUES (
    gen_random_uuid(), 'java-intro', 'easy', 'Hello World', 'java',
    'public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, Java Mastery!");
    }
}',
    'O(1)', 'O(1)', true
  );

  ---------------------------------------------------------
  -- Data Types And Variables
  ---------------------------------------------------------
  INSERT INTO code_examples (id, topic_slug, difficulty_tier, title, language, code, time_complexity, space_complexity, is_runnable)
  VALUES (
    gen_random_uuid(), 'data-types-and-variables', 'easy', 'Basic Data Types', 'java',
    'public class Solution {
    public static void main(String[] args) {
        int age = 25;
        double salary = 50000.50;
        char grade = ''A'';
        boolean isEmployed = true;
        String name = "DevMastery";
        
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Salary: " + salary);
        System.out.println("Grade: " + grade);
        System.out.println("Employed: " + isEmployed);
    }
}',
    'O(1)', 'O(1)', true
  );

  ---------------------------------------------------------
  -- Operators And Expressions
  ---------------------------------------------------------
  INSERT INTO code_examples (id, topic_slug, difficulty_tier, title, language, code, time_complexity, space_complexity, is_runnable)
  VALUES (
    gen_random_uuid(), 'operators-and-expressions', 'easy', 'Basic Operators', 'java',
    'public class Solution {
    public static void main(String[] args) {
        int a = 10;
        int b = 5;
        
        System.out.println("Addition: " + (a + b));
        System.out.println("Subtraction: " + (a - b));
        System.out.println("Multiplication: " + (a * b));
        System.out.println("Division: " + (a / b));
        System.out.println("Remainder: " + (a % b));
    }
}',
    'O(1)', 'O(1)', true
  );

  ---------------------------------------------------------
  -- Control Flow
  ---------------------------------------------------------
  INSERT INTO code_examples (id, topic_slug, difficulty_tier, title, language, code, time_complexity, space_complexity, is_runnable)
  VALUES (
    gen_random_uuid(), 'control-flow', 'easy', 'If-Else Statement', 'java',
    'public class Solution {
    public static void main(String[] args) {
        int score = 85;
        
        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else {
            System.out.println("Grade: C");
        }
    }
}',
    'O(1)', 'O(1)', true
  );

END $$;
