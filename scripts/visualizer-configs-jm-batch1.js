/*
 * visualizer-configs-jm-batch1.js
 * Java Mastery — Batch JM-1: Java Foundations (10 topics)
 * java-intro, variables, basic-types, data-types, operators-and-expressions,
 * control-flow, methods, strings, arrays, arrays-and-tuples
 */
module.exports = {
'java-mastery': {

'java-intro': {
  language: 'java',
  fileName: 'HelloWorld.java',
  steps: [
    {
      title: 'Write your first Java program',
      description: 'Every Java program starts with a class. The JVM looks for `public static void main(String[] args)` as the entry point and runs it.',
      code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      highlight: [2, 3],
      diagram: { kind: 'flow', steps: [
        { label: 'Write source  HelloWorld.java', done: true },
        { label: 'Compile  javac HelloWorld.java', active: true },
        { label: 'JVM loads  java HelloWorld' },
        { label: 'main() runs → output printed' },
      ]},
    },
    {
      title: 'Compile once, run anywhere',
      description: 'javac compiles your .java source to platform-neutral .class bytecode. The JVM (JRE) on ANY OS interprets/JIT-compiles that bytecode.',
      code: `// compile
javac HelloWorld.java   //  HelloWorld.class
// run on any platform
java HelloWorld         //  Hello, World!`,
      diagram: { kind: 'boxes', title: 'Write Once Run Anywhere', items: [
        { label: '.java source', color: '#818cf8' },
        { label: 'javac', color: '#f59e0b' },
        { label: '.class bytecode', color: '#818cf8', highlight: true },
        { label: 'JVM (Linux)', color: '#10b981' },
        { label: 'JVM (Windows)', color: '#10b981' },
        { label: 'JVM (Mac)', color: '#10b981' },
      ]},
    },
    {
      title: 'JVM, JRE, JDK — the three rings',
      description: 'JVM = runtime engine that runs bytecode. JRE = JVM + standard library. JDK = JRE + compiler + dev tools. As a developer you always install the JDK.',
      code: `// JDK includes:
// - javac   (compiler)
// - java    (JVM launcher)
// - jar     (package tool)
// - javadoc (docs generator)
// - jshell  (REPL, Java 9+)`,
      diagram: { kind: 'boxes', title: 'JDK ⊃ JRE ⊃ JVM', items: [
        { label: 'JDK', color: '#818cf8' },
        { label: 'JRE ⊂ JDK', color: '#10b981' },
        { label: 'JVM ⊂ JRE', color: '#10b981', highlight: true },
        { label: 'std lib ⊂ JRE', color: '#f59e0b' },
      ]},
    },
    {
      title: 'Strong static typing',
      description: 'Java is statically typed — every variable and return type is declared at compile time. The compiler rejects type mismatches before the program ever runs.',
      code: `int count = 5;
String name = "Alice";
// count = "hello";  ← compile error: incompatible types
boolean flag = count > 3;   // true`,
      highlight: [1, 2, 4],
      diagram: { kind: 'memory',
        stack: [
          { label: 'count', value: '5',      type: 'int' },
          { label: 'name',  value: '→ heap',  type: 'String' },
          { label: 'flag',  value: 'true',    type: 'boolean', highlight: true },
        ],
        heap: [{ label: 'String@...', fields: [['value', '"Alice"']] }] },
    },
    {
      title: 'Classes are the building blocks',
      description: 'Everything in Java lives inside a class. Classes define fields (state) and methods (behaviour). An object is a runtime instance of a class allocated on the heap.',
      code: `class Dog {
    String name;   // field
    void bark() { System.out.println(name + ": Woof!"); }
}
Dog d = new Dog();   // object on heap
d.name = "Rex";
d.bark();`,
      highlight: [5, 6, 7],
      diagram: { kind: 'memory',
        stack: [{ label: 'd', value: '→ 0x3b20', type: 'Dog ref', highlight: true }],
        heap: [{ label: 'Dog@0x3b20', fields: [['name', '"Rex"']], highlight: true }] },
    },
  ],
},

'variables': {
  language: 'java',
  fileName: 'Variables.java',
  steps: [
    {
      title: 'Declaring and initializing',
      description: 'A variable declaration creates a named storage slot. Initialization assigns a value. In Java, local variables MUST be initialized before use — the compiler enforces this.',
      code: `int age = 25;         // declare + initialize
String city;          // declare (not initialized)
// System.out.println(city);  ← compile error
city = "London";      // now initialized`,
      highlight: [1, 4],
      diagram: { kind: 'memory',
        stack: [
          { label: 'age',  value: '25',     type: 'int', highlight: true },
          { label: 'city', value: '"London"', type: 'String' },
        ], heap: [] },
    },
    {
      title: 'Primitive vs reference types',
      description: 'Primitives (int, double, boolean, char, …) store raw values directly on the stack. Reference types (String, arrays, objects) store a heap address on the stack.',
      code: `int x = 10;           // value IS 10 on stack
String s = "hi";      // value is an ADDRESS to "hi"
int[] arr = {1,2,3};  // value is an ADDRESS to the array`,
      highlight: [1, 2, 3],
      diagram: { kind: 'memory',
        stack: [
          { label: 'x',   value: '10',       type: 'int', highlight: true },
          { label: 's',   value: '→ 0x1a40',  type: 'ref' },
          { label: 'arr', value: '→ 0x2c80',  type: 'ref' },
        ],
        heap: [
          { label: 'String@0x1a40', fields: [['value', '"hi"']] },
          { label: 'int[]@0x2c80',  fields: [['[0]','1'],['[1]','2'],['[2]','3']] },
        ] },
    },
    {
      title: 'var — local variable type inference (Java 10+)',
      description: '`var` lets the compiler infer the type from the right-hand side. It is still statically typed — you just don\'t have to repeat the type name.',
      code: `var count = 42;           // int
var items = new ArrayList<String>();
var map = new HashMap<Integer, List<String>>();
// count = "hello";  ← still a compile error`,
      highlight: [1, 2, 3],
      diagram: { kind: 'boxes', title: 'var infers the type at compile time', items: [
        { label: 'var count = 42', color: '#818cf8', value: '→ int' },
        { label: 'var items = new ArrayList<>()', color: '#818cf8', value: '→ ArrayList<String>' },
      ]},
    },
    {
      title: 'Scope — block lifetime',
      description: 'A variable lives from its declaration to the closing `}` of the block it was declared in. Accessing it outside that block is a compile error.',
      code: `{
    int inner = 5;   // lives inside this block
}
// System.out.println(inner);  ← compile error: cannot find symbol`,
      highlight: [2],
      diagram: { kind: 'flow', steps: [
        { label: '{ — block starts · variable allocated', done: true },
        { label: 'inner = 5 · on stack', active: true },
        { label: '} — block ends · variable freed' },
        { label: 'outer code: inner is GONE' },
      ]},
    },
    {
      title: 'Constants with final',
      description: '`final` on a local variable or field means "assign once, never reassign". Use it for constants and for effectively-final captures in lambdas.',
      code: `final int MAX = 100;
// MAX = 200;  ← compile error: cannot assign to final variable
final String greeting = "Hello";

// Lambda capture requires effectively final
int multiplier = 3;
var fn = (int x) -> x * multiplier;  // OK — never reassigned`,
      highlight: [1, 6, 7],
      diagram: { kind: 'boxes', title: 'final enforces single-assignment', items: [
        { label: 'final int MAX = 100', color: '#10b981', highlight: true },
        { label: 'reassign → compile error', color: '#ef4444' },
      ]},
    },
  ],
},

'basic-types': {
  language: 'java',
  fileName: 'Types.java',
  steps: [
    {
      title: 'The 8 primitive types',
      description: 'Java has exactly 8 primitive types. They are not objects — they live directly on the stack or as fields inside an object on the heap.',
      code: `byte   b = 127;         // 8-bit  signed
short  s = 32767;       // 16-bit signed
int    i = 2_147_483_647;
long   l = 9L;          // 64-bit, needs L suffix
float  f = 3.14f;       // 32-bit float, needs f
double d = 3.14159;     // 64-bit float (default)
boolean ok = true;
char   c = 'A';         // 16-bit Unicode`,
      highlight: [1, 2, 3, 4, 5, 6, 7, 8],
      diagram: { kind: 'boxes', title: '8 primitive types', items: [
        { label: 'byte',    value: '8 bit',   color: '#818cf8' },
        { label: 'short',   value: '16 bit',  color: '#818cf8' },
        { label: 'int',     value: '32 bit',  color: '#10b981', highlight: true },
        { label: 'long',    value: '64 bit',  color: '#818cf8' },
        { label: 'float',   value: '32 bit',  color: '#f59e0b' },
        { label: 'double',  value: '64 bit',  color: '#f59e0b', highlight: true },
        { label: 'boolean', value: '1 bit',   color: '#818cf8' },
        { label: 'char',    value: '16 bit',  color: '#818cf8' },
      ]},
    },
    {
      title: 'Integer overflow wraps silently',
      description: 'Java does NOT throw on integer overflow — it wraps around. `Integer.MAX_VALUE + 1` becomes `Integer.MIN_VALUE`. Use `long` or `BigInteger` for large values.',
      code: `int max = Integer.MAX_VALUE;   // 2_147_483_647
int wrapped = max + 1;          // -2_147_483_648 !
System.out.println(wrapped);    // silent bug
// Safe: use long
long safe = (long) max + 1;     // 2_147_483_648`,
      highlight: [2, 5],
      diagram: { kind: 'boxes', title: 'Overflow wraps (no exception)', items: [
        { label: 'MAX_VALUE', value: '2147483647',  color: '#818cf8' },
        { label: '+1',        value: '→ wraps',     color: '#ef4444' },
        { label: 'MIN_VALUE', value: '-2147483648', color: '#ef4444', highlight: true },
      ]},
    },
    {
      title: 'Widening — safe implicit cast',
      description: 'Java automatically widens a smaller type to a larger one. No data loss. Order: byte → short → int → long → float → double.',
      code: `int   i = 100;
long  l = i;        // widening: int → long  (automatic)
float f = l;        // widening: long → float (automatic)
double d = f;       // fine`,
      highlight: [2, 3],
      diagram: { kind: 'flow', steps: [
        { label: 'byte', done: true },
        { label: 'short', done: true },
        { label: 'int', done: true },
        { label: 'long → float', active: true },
        { label: 'double' },
      ]},
    },
    {
      title: 'Narrowing — explicit cast required',
      description: 'Going from a larger type to a smaller one requires an explicit cast. High-order bits are truncated — potential data loss.',
      code: `double d = 9.99;
int   i = (int) d;    // explicit cast: 9 (truncated)
long  l = 1000L;
byte  b = (byte) l;   // high bits lost: 1000 & 0xFF = -24`,
      highlight: [2, 4],
      diagram: { kind: 'boxes', title: 'Narrowing truncates bits', items: [
        { label: 'double 9.99', color: '#818cf8' },
        { label: '(int) cast', color: '#f59e0b' },
        { label: 'int 9', color: '#ef4444', value: '.99 lost', highlight: true },
      ]},
    },
    {
      title: 'String — not a primitive',
      description: 'String is a class, not a primitive. String literals are pooled — two `"hello"` literals may share the same object. Use `.equals()` for content comparison, never `==`.',
      code: `String a = "hello";
String b = "hello";
System.out.println(a == b);       // true (both point to pool)
String c = new String("hello");
System.out.println(a == c);       // false (different objects!)
System.out.println(a.equals(c));  // true (same content)`,
      highlight: [3, 5, 6],
      diagram: { kind: 'memory',
        stack: [
          { label: 'a', value: '→ pool@0x100' },
          { label: 'b', value: '→ pool@0x100', note: 'same ref' },
          { label: 'c', value: '→ heap@0x200', highlight: true },
        ],
        heap: [
          { label: 'String@0x100 (pool)', fields: [['value','"hello"']], highlight: true },
          { label: 'String@0x200 (heap)', fields: [['value','"hello"']] },
        ] },
    },
  ],
},

'data-types': {
  language: 'java',
  fileName: 'DataTypes.java',
  steps: [
    {
      title: 'Primitive vs Reference — memory layout',
      description: 'Primitives store their VALUE directly. References store a POINTER (4–8 bytes) that points to an object on the heap.',
      code: `int    age  = 30;           // 4 bytes on stack
double price = 19.99;       // 8 bytes on stack
String name  = "Bob";       // 4-byte ref + heap object
Object obj   = new Object();// ref + empty heap object`,
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'memory',
        stack: [
          { label: 'age',   value: '30',     type: 'int (4B)' },
          { label: 'price', value: '19.99',  type: 'double (8B)' },
          { label: 'name',  value: '→ 0x1f0', type: 'ref (4B)', highlight: true },
        ],
        heap: [{ label: 'String@0x1f0', fields: [['value', '"Bob"']], highlight: true }] },
    },
    {
      title: 'char and Unicode',
      description: 'char is a 16-bit unsigned integer holding a Unicode code point (0–65535). Use single quotes for literals. Emojis / supplementary chars need two chars (surrogate pairs).',
      code: `char letter = 'A';       // code point 65
char pi = '\u03C0';      // π (Greek pi)
char emoji = '\uD83D';   // first half of 😀 surrogate pair
int code = (int) letter; // 65`,
      highlight: [1, 2, 4],
      diagram: { kind: 'boxes', title: 'char = 16-bit Unicode', items: [
        { label: "'A'",  value: 'U+0041 = 65',  color: '#10b981' },
        { label: "'π'",  value: 'U+03C0',        color: '#10b981' },
        { label: "'\\uD83D'", value: 'surrogate pair', color: '#f59e0b', highlight: true },
      ]},
    },
    {
      title: 'boolean — only true or false',
      description: 'boolean holds exactly `true` or `false`. It is NOT 0/1 — you cannot cast between boolean and int in Java.',
      code: `boolean active = true;
boolean empty  = false;
// int i = active;  ← compile error!
// active = 1;      ← compile error!
if (active) System.out.println("on");`,
      highlight: [1, 2, 5],
      diagram: { kind: 'boxes', title: 'boolean is NOT 0/1', items: [
        { label: 'true',  color: '#10b981', highlight: true },
        { label: 'false', color: '#ef4444' },
        { label: '0 or 1 = compile error', color: '#ef4444' },
      ]},
    },
    {
      title: 'Type promotion in expressions',
      description: 'When mixing types in arithmetic, smaller types are automatically promoted. byte/short are promoted to int; int + long → long; int + double → double.',
      code: `byte  a = 10;
byte  b = 20;
byte  c = (byte)(a + b);  // need explicit cast: a+b is int
int   d = a + b;          // fine: auto-promoted to int
double e = d + 1.5;       // int + double → double`,
      highlight: [3, 4, 5],
      diagram: { kind: 'flow', steps: [
        { label: 'byte op byte → int (promoted)', done: true },
        { label: 'int op long → long', done: true },
        { label: 'int op double → double', active: true },
        { label: 'assign back: explicit cast if narrowing' },
      ]},
    },
    {
      title: 'Reference equality vs value equality',
      description: '`==` on references checks if two variables point to the SAME object. Use `.equals()` to compare content.',
      code: `Integer x = 200;
Integer y = 200;
System.out.println(x == y);      // false (two heap objects)
System.out.println(x.equals(y)); // true  (same value)
Integer a = 100, b = 100;
System.out.println(a == b);      // true  (Integer cache -128..127)`,
      highlight: [3, 4, 6],
      diagram: { kind: 'boxes', title: '== vs equals()', items: [
        { label: '== for primitives', color: '#10b981', value: 'value compare' },
        { label: '== for objects',    color: '#ef4444', value: 'reference compare' },
        { label: '.equals()',         color: '#10b981', value: 'content compare', highlight: true },
      ]},
    },
  ],
},

'operators-and-expressions': {
  language: 'java',
  fileName: 'Operators.java',
  steps: [
    {
      title: 'Arithmetic operators',
      description: 'Standard arithmetic: +, -, *, /, %. Integer division truncates (5/2 = 2). % gives the remainder. Unary -/+ also exist.',
      code: `int a = 10, b = 3;
System.out.println(a + b);   // 13
System.out.println(a / b);   // 3  (truncated, not 3.33)
System.out.println(a % b);   // 1  (remainder)
double d = 10.0 / 3;         // 3.3333... (double division)`,
      highlight: [3, 4, 5],
      diagram: { kind: 'boxes', title: 'Arithmetic', items: [
        { label: '10 / 3',   value: '3 (truncated)', color: '#f59e0b', highlight: true },
        { label: '10 % 3',   value: '1 (remainder)',  color: '#818cf8' },
        { label: '10.0 / 3', value: '3.333...',       color: '#10b981' },
      ]},
    },
    {
      title: 'Comparison and logical operators',
      description: '==, !=, <, >, <=, >= produce boolean. && and || are short-circuit: if the left side determines the result, the right side is NOT evaluated.',
      code: `int x = 5;
boolean gt = x > 3;           // true
boolean and = (x > 0) && (x < 10);  // true (both evaluated)
boolean sc  = (x > 10) && riskyCall(); // false: riskyCall NOT called
boolean or  = (x > 0)  || riskyCall(); // true:  riskyCall NOT called`,
      highlight: [4, 5],
      diagram: { kind: 'flow', steps: [
        { label: '(x > 10) → false', done: true },
        { label: '&& short-circuit: right side SKIPPED', active: true },
        { label: 'final result: false' },
      ]},
    },
    {
      title: 'Increment / decrement — pre vs post',
      description: '++i increments BEFORE the value is used. i++ increments AFTER. This matters when used inside larger expressions.',
      code: `int i = 5;
int a = i++;   // a = 5, i = 6  (post: use then increment)
int b = ++i;   // b = 7, i = 7  (pre: increment then use)
System.out.println(a + " " + b + " " + i);  // 5 7 7`,
      highlight: [2, 3],
      diagram: { kind: 'boxes', title: 'Pre vs post increment', items: [
        { label: 'i++', value: 'use first, add 1', color: '#f59e0b', highlight: true },
        { label: '++i', value: 'add 1 first, use', color: '#10b981' },
      ]},
    },
    {
      title: 'Bitwise operators',
      description: '&, |, ^, ~, <<, >>, >>> operate on individual bits. Most common in flags, hash functions, and performance-critical code.',
      code: `int a = 0b1010;   // 10
int b = 0b1100;   // 12
System.out.println(a & b);   // 0b1000 = 8  (AND)
System.out.println(a | b);   // 0b1110 = 14 (OR)
System.out.println(a << 1);  // 0b10100 = 20 (left shift = *2)`,
      highlight: [3, 4, 5],
      diagram: { kind: 'boxes', title: 'Bitwise ops', items: [
        { label: 'a = 1010', color: '#818cf8' },
        { label: 'b = 1100', color: '#818cf8' },
        { label: 'a & b = 1000 (8)', color: '#10b981', highlight: true },
        { label: 'a | b = 1110 (14)', color: '#10b981' },
        { label: 'a << 1 = 10100 (20)', color: '#f59e0b' },
      ]},
    },
    {
      title: 'Ternary and instanceof',
      description: 'The ternary `condition ? a : b` is a compact if-else expression. `instanceof` tests the runtime type; Java 16+ pattern matching avoids the explicit cast.',
      code: `int x = 7;
String label = (x % 2 == 0) ? "even" : "odd";  // "odd"

Object obj = "Hello";
if (obj instanceof String s) {  // pattern matching (Java 16+)
    System.out.println(s.toUpperCase());  // s already a String
}`,
      highlight: [2, 4, 5],
      diagram: { kind: 'flow', steps: [
        { label: 'condition evaluated', done: true },
        { label: 'true  → return a', done: true },
        { label: 'false → return b', active: true },
      ]},
    },
  ],
},

'control-flow': {
  language: 'java',
  fileName: 'ControlFlow.java',
  steps: [
    {
      title: 'if / else if / else',
      description: 'The fundamental branching construct. Conditions are boolean expressions. Exactly one branch executes.',
      code: `int score = 75;
if (score >= 90) {
    System.out.println("A");
} else if (score >= 70) {
    System.out.println("B");   // this runs
} else {
    System.out.println("C");
}`,
      highlight: [4, 5],
      diagram: { kind: 'flow', steps: [
        { label: 'score >= 90?', done: true, note: 'false' },
        { label: 'score >= 70?', active: true, note: 'true → print B' },
        { label: 'else: print C' },
      ]},
    },
    {
      title: 'switch expression (Java 14+)',
      description: 'The modern switch expression returns a value, uses arrow syntax, and doesn\'t fall through. Use it instead of the old switch statement.',
      code: `String day = "MON";
int numLetters = switch (day) {
    case "MON", "FRI", "SUN" -> 6;
    case "TUE"               -> 7;
    case "THU", "SAT"        -> 8;
    case "WED"               -> 9;
    default -> throw new IllegalArgumentException(day);
};`,
      highlight: [2, 3, 4, 5],
      diagram: { kind: 'boxes', title: 'switch expression — no fall-through', items: [
        { label: '"MON" → 6', color: '#10b981', highlight: true },
        { label: '"TUE" → 7', color: '#818cf8' },
        { label: '"WED" → 9', color: '#818cf8' },
        { label: 'default → throw', color: '#ef4444' },
      ]},
    },
    {
      title: 'for loop',
      description: 'Three-part for loop: init; condition; update. Enhanced for-each for iterables. Both compile to roughly the same bytecode.',
      code: `// classic for
for (int i = 0; i < 5; i++) { System.out.print(i + " "); }
// 0 1 2 3 4

// for-each
int[] nums = {10, 20, 30};
for (int n : nums) { System.out.print(n + " "); }
// 10 20 30`,
      highlight: [2, 6, 7],
      diagram: { kind: 'flow', steps: [
        { label: 'init: i = 0', done: true },
        { label: 'condition: i < 5?', active: true },
        { label: 'body: print i' },
        { label: 'update: i++' },
        { label: 'loop back to condition' },
      ]},
    },
    {
      title: 'while and do-while',
      description: 'while checks the condition BEFORE executing. do-while checks AFTER — the body always runs at least once.',
      code: `int n = 0;
while (n < 3) {
    System.out.println("while " + n++);
}

int m = 5;
do {
    System.out.println("do " + m++);
} while (m < 3);   // runs ONCE even though 5 < 3 is false`,
      highlight: [2, 3, 6, 7, 8, 9],
      diagram: { kind: 'boxes', title: 'while vs do-while', items: [
        { label: 'while', value: 'check BEFORE body', color: '#818cf8' },
        { label: 'do-while', value: 'check AFTER body (runs ≥1×)', color: '#10b981', highlight: true },
      ]},
    },
    {
      title: 'break, continue, labels',
      description: '`break` exits the innermost loop. `continue` skips the rest of the body and goes to the next iteration. Labels let break/continue target an outer loop.',
      code: `outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) continue outer;  // skip to next i
        if (i == 2) break outer;     // exit both loops
        System.out.println(i + "," + j);
    }
}`,
      highlight: [4, 5],
      diagram: { kind: 'flow', steps: [
        { label: 'j == 1 → continue outer (next i)', active: true },
        { label: 'i == 2 → break outer (exit both loops)' },
        { label: 'otherwise: print i,j' },
      ]},
    },
  ],
},

'methods': {
  language: 'java',
  fileName: 'Methods.java',
  steps: [
    {
      title: 'Method anatomy',
      description: 'A method has a return type, a name, parameters (optional), a body, and possibly throws declarations. `static` methods belong to the class; instance methods belong to an object.',
      code: `public static int add(int a, int b) {
    return a + b;
}
// return-type: int
// name: add
// params: int a, int b`,
      highlight: [1, 2, 3],
      diagram: { kind: 'boxes', title: 'Method signature parts', items: [
        { label: 'public', color: '#818cf8', value: 'visibility' },
        { label: 'static', color: '#f59e0b', value: 'belongs to class' },
        { label: 'int',    color: '#10b981', value: 'return type' },
        { label: 'add',    color: '#818cf8', value: 'name' },
        { label: 'int a, int b', color: '#818cf8', value: 'params' },
      ]},
    },
    {
      title: 'Stack frames',
      description: 'Each method call creates a NEW stack frame holding local variables and the return address. Frames are pushed on call and popped on return.',
      code: `public static int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);   // recursive call
}
factorial(4);
// stack: factorial(4) → factorial(3) → factorial(2) → factorial(1)`,
      highlight: [3, 5],
      diagram: { kind: 'memory',
        stack: [
          { label: 'factorial(1)', value: 'returns 1', type: 'frame', highlight: true },
          { label: 'factorial(2)', value: 'n=2', type: 'frame' },
          { label: 'factorial(3)', value: 'n=3', type: 'frame' },
          { label: 'factorial(4)', value: 'n=4', type: 'frame' },
          { label: 'main', value: '...', type: 'frame' },
        ], heap: [] },
    },
    {
      title: 'Pass-by-value',
      description: 'Java is ALWAYS pass-by-value. For primitives the value is copied. For objects a COPY OF THE REFERENCE is passed — modifying the object works, but reassigning the parameter does not affect the caller.',
      code: `void changeInt(int n) { n = 99; }       // has no effect
void addToList(List<Integer> list) {
    list.add(42);   // modifies the SAME list object
}
void replaceList(List<Integer> list) {
    list = new ArrayList<>();  // only changes local copy
}`,
      highlight: [1, 3, 6],
      diagram: { kind: 'boxes', title: 'Pass-by-value always', items: [
        { label: 'primitive', value: 'copy of value', color: '#818cf8' },
        { label: 'object',    value: 'copy of reference', color: '#f59e0b', highlight: true },
        { label: 'mutation via ref', value: 'affects original', color: '#10b981' },
        { label: 'reassign param',   value: 'NO effect outside', color: '#ef4444' },
      ]},
    },
    {
      title: 'Overloading',
      description: 'Multiple methods can share the same name if their parameter lists differ (type, count, or order). The compiler picks the best match at compile time.',
      code: `int    sum(int a, int b)          { return a + b; }
double sum(double a, double b)    { return a + b; }
int    sum(int a, int b, int c)   { return a + b + c; }

sum(1, 2);        // int version
sum(1.0, 2.0);    // double version
sum(1, 2, 3);     // 3-arg version`,
      highlight: [5, 6, 7],
      diagram: { kind: 'flow', steps: [
        { label: 'call sum(1, 2)', done: true },
        { label: 'compiler matches parameter types', done: true },
        { label: 'selects sum(int, int)', active: true },
      ]},
    },
    {
      title: 'Varargs',
      description: '`T... name` declares a vararg — the caller can pass any number of T arguments (including zero). Internally it becomes an array. Useful for printf-style APIs.',
      code: `int sum(int... nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
sum(1, 2, 3);         // 6
sum(10, 20, 30, 40);  // 100
sum();                 // 0 — empty array`,
      highlight: [1, 6, 7, 8],
      diagram: { kind: 'boxes', title: 'varargs = array under the hood', items: [
        { label: 'sum(1,2,3)',    value: '→ int[]{1,2,3}',   color: '#10b981' },
        { label: 'sum()',         value: '→ int[]{}',         color: '#818cf8' },
      ]},
    },
  ],
},

'strings': {
  language: 'java',
  fileName: 'Strings.java',
  steps: [
    {
      title: 'String is immutable',
      description: 'Every "modification" of a String creates a NEW object. The original is never changed. This is why String is safe to share across threads without synchronization.',
      code: `String s = "hello";
s = s + " world";      // new object "hello world"
String original = "hello";  // original unchanged
System.out.println(original);  // "hello"`,
      highlight: [2],
      diagram: { kind: 'memory',
        stack: [
          { label: 's',        value: '→ 0x3c00', type: 'ref' },
          { label: 'original', value: '→ 0x1a00', type: 'ref' },
        ],
        heap: [
          { label: 'String@0x1a00', fields: [['value', '"hello"']] },
          { label: 'String@0x3c00', fields: [['value', '"hello world"']], highlight: true },
        ] },
    },
    {
      title: 'String pool — literals are interned',
      description: 'String literals are stored in the String pool (inside the heap). Two `"hello"` literals share the same pooled object. `new String("hello")` always creates a new heap object outside the pool.',
      code: `String a = "hello";           // pool ref
String b = "hello";           // same pool ref
String c = new String("hello"); // new heap object

System.out.println(a == b);   // true  (same pool ref)
System.out.println(a == c);   // false (different ref)
String d = c.intern();        // force into pool
System.out.println(a == d);   // true  (now same pool ref)`,
      highlight: [1, 2, 3, 7],
      diagram: { kind: 'memory',
        stack: [
          { label: 'a', value: '→ pool@0x100' },
          { label: 'b', value: '→ pool@0x100' },
          { label: 'c', value: '→ heap@0x200', highlight: true },
        ],
        heap: [
          { label: '"hello" (pool@0x100)', fields: [], highlight: true },
          { label: '"hello" (heap@0x200)', fields: [] },
        ] },
    },
    {
      title: 'Useful String methods',
      description: 'String has 60+ methods. The most commonly used: length, charAt, substring, contains, indexOf, replace, split, trim/strip, toUpperCase, formatted (Java 15+).',
      code: `String s = "  Hello, World!  ";
s.trim();           // "Hello, World!"
s.strip();          // same + handles Unicode whitespace
s.toLowerCase();    // "  hello, world!  "
s.replace("World", "Java");
"a,b,c".split(","); // ["a","b","c"]
String.format("Hi %s, you are %d", "Alice", 30);`,
      highlight: [2, 4, 5, 6, 7],
      diagram: { kind: 'boxes', title: 'Common String methods', items: [
        { label: '.length()',   color: '#818cf8' },
        { label: '.charAt(i)',  color: '#818cf8' },
        { label: '.substring()', color: '#818cf8' },
        { label: '.split()',    color: '#10b981', highlight: true },
        { label: '.strip()',    color: '#10b981' },
        { label: '.formatted()', color: '#f59e0b' },
      ]},
    },
    {
      title: 'StringBuilder for concatenation in loops',
      description: 'Concatenating Strings in a loop with `+` creates a new object every iteration — O(n²). StringBuilder appends to a resizable buffer — O(n) total.',
      code: `// SLOW: O(n^2) — each + creates a new String
String result = "";
for (int i = 0; i < 10_000; i++) result += i;

// FAST: O(n) — one buffer
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10_000; i++) sb.append(i);
String result2 = sb.toString();`,
      highlight: [5, 6, 7, 8],
      diagram: { kind: 'boxes', title: 'String + vs StringBuilder', items: [
        { label: '"" + i',      value: 'new object each loop', color: '#ef4444' },
        { label: 'sb.append(i)', value: 'one buffer',           color: '#10b981', highlight: true },
      ]},
    },
    {
      title: 'Text blocks (Java 15+)',
      description: 'Text blocks are multi-line String literals enclosed in `"""`. Leading indentation is stripped. Great for JSON, SQL, HTML in tests.',
      code: `String json = """
        {
            "name": "Alice",
            "age": 30
        }
        """;
System.out.println(json);   // pretty-printed JSON`,
      highlight: [1, 2, 3, 4, 5, 6],
      diagram: { kind: 'boxes', title: 'Text block stripping rules', items: [
        { label: '""" ..."""', value: 'raw string', color: '#818cf8' },
        { label: 'leading spaces stripped to incidental margin', color: '#10b981', highlight: true },
        { label: '\\n at end: re-delimiter moves it', color: '#f59e0b' },
      ]},
    },
  ],
},

'arrays': {
  language: 'java',
  fileName: 'Arrays.java',
  steps: [
    {
      title: 'Array allocation on the heap',
      description: 'An array in Java is an object on the heap. The variable holds a reference. The length is fixed at creation time and immutable.',
      code: `int[] nums = new int[5];    // [0, 0, 0, 0, 0]
nums[0] = 10;
nums[4] = 50;
// nums[5] = 99;  ← ArrayIndexOutOfBoundsException`,
      highlight: [1, 2, 3],
      diagram: { kind: 'memory',
        stack: [{ label: 'nums', value: '→ 0x2a00', type: 'int[] ref', highlight: true }],
        heap: [{ label: 'int[]@0x2a00', fields: [['[0]','10'],['[1]','0'],['[2]','0'],['[3]','0'],['[4]','50']], highlight: true }] },
    },
    {
      title: 'Initializer syntax',
      description: 'The array literal syntax `{1,2,3}` can only be used at declaration. Elsewhere use `new int[]{1,2,3}` if you need an inline literal.',
      code: `// Only at declaration
int[] a = {10, 20, 30};

// Inline (e.g., pass to method)
printAll(new int[]{10, 20, 30});

// Multi-dimensional
int[][] matrix = {{1,2},{3,4},{5,6}};`,
      highlight: [2, 5, 8],
      diagram: { kind: 'memory',
        stack: [{ label: 'a', value: '→ 0x1100', type: 'int[]' }],
        heap: [
          { label: 'int[]@0x1100', fields: [['[0]','10'],['[1]','20'],['[2]','30']], highlight: true },
        ] },
    },
    {
      title: 'Arrays.sort and Arrays.binarySearch',
      description: 'Arrays.sort uses Dual-Pivot Quicksort (primitives) or TimSort (objects). After sorting, Arrays.binarySearch returns the index in O(log n).',
      code: `int[] arr = {5, 2, 8, 1, 9, 3};
java.util.Arrays.sort(arr);           // [1, 2, 3, 5, 8, 9]
int idx = java.util.Arrays.binarySearch(arr, 5); // → 3`,
      highlight: [2, 3],
      diagram: { kind: 'flow', steps: [
        { label: 'sort({5,2,8,1,9,3}) — TimSort/QuickSort', done: true },
        { label: 'sorted: {1,2,3,5,8,9}', done: true },
        { label: 'binarySearch(5) — index 3', active: true },
      ]},
    },
    {
      title: 'Arrays.copyOf and System.arraycopy',
      description: 'Arrays are fixed size. To "resize", create a new array and copy. Arrays.copyOf is convenient. System.arraycopy is the fastest native bulk copy.',
      code: `int[] src = {1, 2, 3, 4, 5};
int[] grown = java.util.Arrays.copyOf(src, 8);
// [1, 2, 3, 4, 5, 0, 0, 0]

// Fast native bulk copy
System.arraycopy(src, 0, grown, 0, src.length);`,
      highlight: [2, 5],
      diagram: { kind: 'boxes', title: 'Resizing = copy to new array', items: [
        { label: 'src[5]',    value: '[1,2,3,4,5]' },
        { label: 'copyOf(8)', value: '[1,2,3,4,5,0,0,0]', color: '#10b981', highlight: true },
      ]},
    },
    {
      title: 'Reference arrays and covariance',
      description: 'String[] is a subtype of Object[]. This sounds nice but enables ArrayStoreException at runtime — one reason to prefer generics.',
      code: `String[] strings = new String[3];
Object[] objects = strings;        // compiles (covariance)
objects[0] = "hello";              // fine
objects[1] = 42;                   // ArrayStoreException at runtime!`,
      highlight: [2, 4],
      diagram: { kind: 'boxes', title: 'Array covariance', items: [
        { label: 'String[] ⊆ Object[]', color: '#f59e0b' },
        { label: 'ArrayStoreException if wrong type', color: '#ef4444', highlight: true },
        { label: 'Use List<String> instead', color: '#10b981' },
      ]},
    },
  ],
},

'arrays-and-tuples': {
  language: 'java',
  fileName: 'ArraysAndRecords.java',
  steps: [
    {
      title: 'int[] vs List<Integer>',
      description: '`int[]` is a fixed-size primitive array (fast, cache-friendly). `List<Integer>` is a dynamic, object-based list (flexible but boxes every element).',
      code: `// Array: fixed size, primitives
int[] arr = new int[10];
arr[0] = 1;

// List: dynamic, boxed
List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);
list.remove(Integer.valueOf(1));`,
      highlight: [2, 6, 7, 8],
      diagram: { kind: 'memory',
        stack: [
          { label: 'arr',  value: '→ 0x1000', type: 'int[]' },
          { label: 'list', value: '→ 0x2000', type: 'List<Integer>', highlight: true },
        ],
        heap: [
          { label: 'int[]@0x1000', fields: [['len','10'],['[0]','1']] },
          { label: 'ArrayList@0x2000', fields: [['size','2'],['[0]','Integer(1)'],['[1]','Integer(2)']], highlight: true },
        ] },
    },
    {
      title: 'Multi-dimensional arrays',
      description: 'A 2D array in Java is an array-of-arrays. Rows can have different lengths (jagged). Access with arr[row][col].',
      code: `int[][] matrix = new int[3][4];
matrix[0][0] = 1;

// Jagged (different row sizes)
int[][] jagged = new int[3][];
jagged[0] = new int[2];
jagged[1] = new int[5];`,
      highlight: [1, 5, 6, 7],
      diagram: { kind: 'memory',
        stack: [{ label: 'matrix', value: '→ rows array', type: 'int[][]' }],
        heap: [
          { label: 'row[0]', fields: [['[0]','1'],['[1]','0'],['[2]','0'],['[3]','0']] },
          { label: 'row[1]', fields: [['[0]','0'],['...','...']] },
        ] },
    },
    {
      title: 'Record as a value tuple (Java 16+)',
      description: 'Java has no built-in "tuple". Use a `record` — a final, immutable class with auto-generated constructor, equals, hashCode, and toString.',
      code: `record Point(int x, int y) {}
record Pair<A, B>(A first, B second) {}

var p = new Point(3, 4);
System.out.println(p.x());     // 3
System.out.println(p);         // Point[x=3, y=4]
var pair = new Pair<>("hello", 42);`,
      highlight: [1, 2, 4, 5],
      diagram: { kind: 'memory',
        stack: [{ label: 'p', value: '→ heap', type: 'Point' }],
        heap: [{ label: 'Point', fields: [['x','3'],['y','4']], highlight: true }] },
    },
    {
      title: 'Arrays.asList vs List.of',
      description: '`Arrays.asList` returns a fixed-size list backed by the array (set works, add/remove throws). `List.of` returns a truly immutable list.',
      code: `List<String> backed = Arrays.asList("a", "b", "c");
backed.set(0, "z");   // OK
backed.add("d");       // UnsupportedOperationException

List<String> immutable = List.of("a", "b", "c");
immutable.set(0, "z"); // UnsupportedOperationException`,
      highlight: [2, 3, 5, 6],
      diagram: { kind: 'boxes', title: 'List creation', items: [
        { label: 'Arrays.asList', value: 'fixed-size, mutable values', color: '#f59e0b' },
        { label: 'List.of',       value: 'truly immutable',             color: '#10b981', highlight: true },
        { label: 'new ArrayList<>()', value: 'fully mutable',           color: '#818cf8' },
      ]},
    },
    {
      title: 'Spread + collect with streams',
      description: 'Stream.of / Arrays.stream let you process arrays with the stream pipeline API: filter, map, collect back to an array or list.',
      code: `int[] src = {1, 2, 3, 4, 5, 6};
int[] evens = Arrays.stream(src)
    .filter(n -> n % 2 == 0)
    .toArray();   // [2, 4, 6]

List<String> words = Arrays.stream(new String[]{"a","b","c"})
    .map(String::toUpperCase)
    .collect(Collectors.toList());   // ["A","B","C"]`,
      highlight: [2, 3, 4, 7, 8],
      diagram: { kind: 'flow', steps: [
        { label: 'Arrays.stream([1..6])', done: true },
        { label: 'filter(n % 2 == 0)', active: true },
        { label: 'toArray() → [2,4,6]' },
      ]},
    },
  ],
},

},  // end java-mastery
};

