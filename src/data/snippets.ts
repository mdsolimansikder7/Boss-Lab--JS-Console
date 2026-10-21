import { Snippet } from '../types';

const JAVASCRIPT_SNIPPETS: Snippet[] = [
  {
    id: 'simple-hello',
    title: 'Simple Hello World',
    category: 'Beginner',
    description: 'A clean and simple Hello World console output',
    code: `// Simple Hello World
console.log("Hello, World!");
console.log("Welcome to Boss Lab!");
`
  },
  {
    id: 'simple-functions',
    title: 'Simple Functions & Math',
    category: 'Beginner',
    description: 'Easy functions for greeting and adding numbers',
    code: `// Simple Functions
function add(a, b) {
  return a + b;
}

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Boss"));
console.log("10 + 20 =", add(10, 20));
console.log("50 + 100 =", add(50, 100));
`
  },
  {
    id: 'simple-even-odd',
    title: 'Simple Even or Odd Check',
    category: 'Beginner',
    description: 'Simple function to check if a number is even or odd',
    code: `// Simple Even or Odd Check
function checkNumber(num) {
  if (num % 2 === 0) {
    console.log(num + " is an EVEN number");
  } else {
    console.log(num + " is an ODD number");
  }
}

checkNumber(4);
checkNumber(9);
checkNumber(15);
`
  },
  {
    id: 'simple-loop',
    title: 'Simple Loop & Array',
    category: 'Beginner',
    description: 'Print array items using a simple for loop',
    code: `// Simple Loop & Array
const items = ["JavaScript", "HTML", "CSS", "React"];

console.log("Favorite Tech Stack:");
for (let i = 0; i < items.length; i++) {
  console.log((i + 1) + ". " + items[i]);
}
`
  },
  {
    id: 'hello-world',
    title: 'Console Types (log, warn, error)',
    category: 'Beginner',
    description: 'Demonstrating console.log, console.warn, console.error and formatting',
    code: `// Welcome to Boss Lab!
console.log("🧪 Welcome to Boss Lab - JavaScript Playground!");
console.info("ℹ️ Info: You can run code using Ctrl + Enter or the Run button.");
console.warn("⚠️ Warning: Be careful with infinite loops!");
console.error("❌ Error: Demonstrating error styling.");

// Multiple values logging
const name = "Developer";
const year = new Date().getFullYear();
console.log("Logged user:", name, "in year:", year);
`
  },
  {
    id: 'array-methods',
    title: 'Array Methods & Transformations',
    category: 'Data Structures',
    description: 'Demonstrating map, filter, reduce and chaining operations',
    code: `const products = [
  { name: "Laptop", category: "Electronics", price: 1200, rating: 4.8 },
  { name: "Coffee Maker", category: "Appliances", price: 85, rating: 4.2 },
  { name: "Headphones", category: "Electronics", price: 199, rating: 4.6 },
  { name: "Keyboard", category: "Electronics", price: 130, rating: 4.5 },
  { name: "Blender", category: "Appliances", price: 60, rating: 3.9 }
];

console.log("All Products:");
console.table(products);

// Filter electronics over $100
const premiumElectronics = products
  .filter(p => p.category === "Electronics" && p.price > 100)
  .map(p => ({ Item: p.name, Price: \`$\${p.price}\` }));

console.log("Premium Electronics:");
console.table(premiumElectronics);

// Total value calculation
const totalValue = products.reduce((sum, p) => sum + p.price, 0);
console.log(\`💰 Total Inventory Value: $\${totalValue}\`);
`
  },
  {
    id: 'async-await',
    title: 'Async/Await & Fetch API',
    category: 'Async & Fetch',
    description: 'Fetching live data asynchronously from JSONPlaceholder API',
    code: `async function fetchUsers() {
  console.log("🔄 Fetching users from API...");
  console.time("Fetch Duration");

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();
    
    console.timeEnd("Fetch Duration");
    console.log(\`✅ Successfully loaded \${users.length} users!\`);

    // Format top 5 users
    const summary = users.slice(0, 5).map(u => ({
      ID: u.id,
      Name: u.name,
      Username: u.username,
      City: u.address.city,
      Company: u.company.name
    }));

    console.table(summary);
  } catch (err) {
    console.error("Failed to fetch data:", err.message);
  }
}

fetchUsers();
`
  },
  {
    id: 'console-table-matrix',
    title: 'Matrix & Console Table',
    category: 'Data Structures',
    description: 'Using console.table with arrays, objects, and matrices',
    code: `// 2D Matrix
const multiplicationTable = Array.from({ length: 5 }, (_, i) => 
  Array.from({ length: 5 }, (_, j) => (i + 1) * (j + 1))
);

console.log("📊 5x5 Multiplication Table:");
console.table(multiplicationTable);

// Nested Object
const systemStats = {
  CPU: { cores: 8, usage: "24%", temp: "42°C" },
  RAM: { total: "16GB", used: "6.2GB", free: "9.8GB" },
  Storage: { capacity: "1TB SSD", used: "420GB", free: "580GB" }
};

console.log("💻 System Diagnostics:");
console.table(systemStats);
`
  },
  {
    id: 'benchmark-fibonacci',
    title: 'Performance Benchmarking',
    category: 'Algorithms',
    description: 'Compare recursive vs memoized Fibonacci algorithm speed using console.time',
    code: `// 1. Standard Recursive Fibonacci
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// 2. Memoized Fibonacci
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

const N = 35;

console.log(\`⏱️ Benchmarking Fibonacci for N = \${N}\`);

console.time("Naive Recursive");
const res1 = fibNaive(N);
console.timeEnd("Naive Recursive");
console.log("Naive Result:", res1);

console.time("Memoized Recursive");
const res2 = fibMemo(N);
console.timeEnd("Memoized Recursive");
console.log("Memoized Result:", res2);
`
  },
  {
    id: 'oop-classes',
    title: 'Classes & Encapsulation',
    category: 'Beginner',
    description: 'Modern ES6+ classes with private fields and getters/setters',
    code: `class BankAccount {
  #balance = 0; // Private field
  #accountHolder;

  constructor(holderName, initialDeposit = 0) {
    this.#accountHolder = holderName;
    this.#balance = initialDeposit;
    console.log(\`🏦 Account opened for \${holderName} with $\${initialDeposit}\`);
  }

  deposit(amount) {
    if (amount <= 0) {
      console.warn("⚠️ Deposit amount must be positive");
      return;
    }
    this.#balance += amount;
    console.log(\`💵 Deposited $\${amount}. New balance: $\${this.#balance}\`);
  }

  withdraw(amount) {
    if (amount > this.#balance) {
      console.error(\`❌ Insufficient funds! Current balance: $\${this.#balance}\`);
      return;
    }
    this.#balance -= amount;
    console.log(\`💸 Withdrew $\${amount}. Remaining balance: $\${this.#balance}\`);
  }

  get balance() {
    return \`$\${this.#balance}\`;
  }
}

const myAcc = new BankAccount("Sarah Jenkins", 500);
myAcc.deposit(250);
myAcc.withdraw(100);
myAcc.withdraw(1000); // Should warn/error
console.log("Account Summary:", { owner: "Sarah Jenkins", balance: myAcc.balance });
`
  },
  {
    id: 'ascii-art-fun',
    title: 'ASCII Art & Fun Generator',
    category: 'Fun & Utility',
    description: 'Generates a fun ASCII star pyramid and random gradient palette',
    code: `function generatePyramid(height) {
  console.log(\`✨ Star Pyramid (Height: \${height}):\`);
  for (let i = 1; i <= height; i++) {
    const spaces = ' '.repeat(height - i);
    const stars = '⭐'.repeat(i);
    console.log(spaces + stars);
  }
}

generatePyramid(5);

// Random Color Generator
console.log("\\n🎨 Random Color Palette:");
const colors = Array.from({ length: 5 }, () => 
  '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
);

colors.forEach((hex, idx) => {
  console.log(\`Color \${idx + 1}: \${hex}\`);
});
`
  },
  {
    id: 'error-handling',
    title: 'Error Handling & Stack Traces',
    category: 'Algorithms',
    description: 'Demonstrating custom exceptions and stack traces',
    code: `function validateUser(user) {
  console.count("Validations Performed");
  
  if (!user.name) {
    throw new Error("Missing required field: name");
  }
  if (typeof user.age !== 'number' || user.age < 18) {
    throw new RangeError("User must be an adult (age >= 18)");
  }
  return true;
}

try {
  console.log("Validating User 1...");
  validateUser({ name: "Alex", age: 25 });
  console.log("✅ User 1 Valid!");

  console.log("Validating User 2...");
  validateUser({ name: "Bobby", age: 15 });
} catch (err) {
  console.error("Caught Exception:", err.name, "-", err.message);
  console.info("Stack Trace:", err.stack);
}
`
  }
];

const PYTHON_SNIPPETS: Snippet[] = [
  {
    id: 'py-hello',
    title: 'Hello World & f-Strings',
    category: 'Beginner',
    description: 'Print greetings, math and formatted values with modern f-strings',
    language: 'python',
    code: `# Hello World & f-Strings
name = "Boss Lab"
year = 2026

print(f"👋 Hello, {name}!")
print(f"Python can do math: 7 * 6 = {7 * 6}")
print(f"Formatted number: {1234567:,}")
print(f"Percentage: {0.876:.1%}")

languages = ["Python", "JavaScript", "C++", "C"]
print("\\nLanguages I can run:")
for index, language in enumerate(languages, start=1):
    print(f"  {index}. {language}")
`
  },
  {
    id: 'py-collections',
    title: 'Lists, Tuples & Dictionaries',
    category: 'Data Structures',
    description: 'Work with Python lists, tuple unpacking and dictionary loops',
    language: 'python',
    code: `# Lists, Tuples & Dictionaries
scores = [88, 92, 79, 95, 84]
scores.append(90)
scores.sort(reverse=True)

print("Scores:", scores)
print("Highest:", scores[0], "| Lowest:", scores[-1])
print("Average:", sum(scores) / len(scores))

point = (12, 34)
x, y = point
print(f"\\nTuple unpacking: x={x}, y={y}")

user = {"name": "Alex", "role": "Developer", "level": 7}
user["city"] = "Dhaka"

print("\\nUser profile:")
for key, value in user.items():
    print(f"  {key:>8}: {value}")
`
  },
  {
    id: 'py-comprehensions',
    title: 'Comprehensions & Generators',
    category: 'Data Structures',
    description: 'Build lists, dicts and lazy generators in a single expression',
    language: 'python',
    code: `# Comprehensions & Generators
numbers = list(range(1, 11))

squares = [n * n for n in numbers]
evens = [n for n in numbers if n % 2 == 0]
labels = {n: ("even" if n % 2 == 0 else "odd") for n in numbers}

print("Numbers:", numbers)
print("Squares:", squares)
print("Evens  :", evens)
print("Labels :", labels)


def fibonacci(limit):
    a, b = 0, 1
    while a <= limit:
        yield a
        a, b = b, a + b


print("\\nFibonacci generator:", list(fibonacci(100)))
print("Sum of squares:", sum(n * n for n in numbers))
`
  },
  {
    id: 'py-classes',
    title: 'Classes & Dataclasses',
    category: 'Beginner',
    description: 'A bank account class built with dataclasses and type hints',
    language: 'python',
    code: `# Classes & Dataclasses
from dataclasses import dataclass


@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            print("⚠️ Deposit must be positive")
            return
        self.balance += amount
        print(f"💵 {self.owner} deposited \${amount:.2f}")

    def withdraw(self, amount: float) -> None:
        if amount > self.balance:
            print(f"❌ Insufficient funds for {self.owner}")
            return
        self.balance -= amount
        print(f"💸 {self.owner} withdrew \${amount:.2f}")


account = BankAccount("Sarah Jenkins", 500)
account.deposit(250)
account.withdraw(100)
account.withdraw(1000)

print(f"\\nFinal balance: \${account.balance:.2f}")
`
  },
  {
    id: 'py-fibonacci',
    title: 'Fibonacci: Recursive vs Memoized',
    category: 'Algorithms',
    description: 'Compare a naive recursion with an lru_cache version using perf_counter',
    language: 'python',
    code: `# Fibonacci: Recursive vs Memoized
from functools import lru_cache
from time import perf_counter


def fib_naive(n: int) -> int:
    return n if n <= 1 else fib_naive(n - 1) + fib_naive(n - 2)


@lru_cache(maxsize=None)
def fib_memo(n: int) -> int:
    return n if n <= 1 else fib_memo(n - 1) + fib_memo(n - 2)


N = 30

start = perf_counter()
naive = fib_naive(N)
naive_ms = (perf_counter() - start) * 1000

start = perf_counter()
memo = fib_memo(N)
memo_ms = (perf_counter() - start) * 1000

print(f"Fibonacci({N}) = {naive}")
print(f"Naive recursive : {naive_ms:.2f} ms")
print(f"Memoized        : {memo_ms:.3f} ms")
print(f"Speedup         : {naive_ms / max(memo_ms, 0.001):,.0f}x")
`
  },
  {
    id: 'py-prime-sieve',
    title: 'Prime Sieve & Star Pyramid',
    category: 'Fun & Utility',
    description: 'Sieve of Eratosthenes plus a colorful text pyramid',
    language: 'python',
    code: `# Prime Sieve & Star Pyramid
def primes_up_to(limit: int) -> list[int]:
    sieve = [True] * (limit + 1)
    sieve[0:2] = [False, False]

    for number in range(2, int(limit ** 0.5) + 1):
        if sieve[number]:
            for multiple in range(number * number, limit + 1, number):
                sieve[multiple] = False

    return [n for n, is_prime in enumerate(sieve) if is_prime]


limit = 50
primes = primes_up_to(limit)

print(f"Primes up to {limit}:")
print(", ".join(map(str, primes)))
print(f"Total: {len(primes)} primes")

print("\\nStar pyramid:")
height = 5
for row in range(1, height + 1):
    print(" " * (height - row) + "⭐" * row)
`
  }
];

const CPP_SNIPPETS: Snippet[] = [
  {
    id: 'cpp-hello',
    title: 'Hello World & I/O',
    category: 'Beginner',
    description: 'Stream output, strings and a vector loop in modern C++',
    language: 'cpp',
    code: `#include <iostream>
#include <string>
#include <vector>

int main() {
    const std::string name = "Boss Lab";
    std::vector<std::string> languages = {"C++", "Python", "JavaScript", "C"};

    std::cout << "Hello from " << name << "!\\n";
    std::cout << "C++ can do math: 7 * 6 = " << 7 * 6 << "\\n\\n";

    std::cout << "Languages I can run:\\n";
    for (int i = 0; i < static_cast<int>(languages.size()); ++i) {
        std::cout << "  " << (i + 1) << ". " << languages[i] << "\\n";
    }

    return 0;
}
`
  },
  {
    id: 'cpp-vector',
    title: 'Vectors & Range Loops',
    category: 'Data Structures',
    description: 'Store, sort and summarize values with std::vector and accumulate',
    language: 'cpp',
    code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> scores = {88, 92, 79, 95, 84};
    scores.push_back(90);

    std::sort(scores.begin(), scores.end(), std::greater<int>());

    std::cout << "Scores: ";
    for (int score : scores) {
        std::cout << score << ' ';
    }
    std::cout << "\\n";

    int total = std::accumulate(scores.begin(), scores.end(), 0);

    std::cout << "Highest: " << scores.front() << "\\n";
    std::cout << "Lowest : " << scores.back() << "\\n";
    std::cout << "Average: " << static_cast<double>(total) / scores.size() << "\\n";

    return 0;
}
`
  },
  {
    id: 'cpp-classes',
    title: 'Classes & Constructors',
    category: 'Beginner',
    description: 'A BankAccount class with encapsulation and a vector of objects',
    language: 'cpp',
    code: `#include <iostream>
#include <string>
#include <utility>
#include <vector>

class BankAccount {
public:
    BankAccount(std::string owner, double balance = 0.0)
        : owner_(std::move(owner)), balance_(balance) {}

    void deposit(double amount) {
        if (amount <= 0) {
            std::cout << "Deposit must be positive\\n";
            return;
        }
        balance_ += amount;
        std::cout << owner_ << " deposited $" << amount << "\\n";
    }

    void withdraw(double amount) {
        if (amount > balance_) {
            std::cout << "Insufficient funds for " << owner_ << "\\n";
            return;
        }
        balance_ -= amount;
        std::cout << owner_ << " withdrew $" << amount << "\\n";
    }

    const std::string& owner() const { return owner_; }
    double balance() const { return balance_; }

private:
    std::string owner_;
    double balance_;
};

int main() {
    std::vector<BankAccount> accounts;
    accounts.emplace_back("Sarah Jenkins", 500);
    accounts.emplace_back("Alex Rahman", 1200);

    accounts[0].deposit(250);
    accounts[0].withdraw(100);
    accounts[0].withdraw(1000);
    accounts[1].withdraw(200);

    std::cout << "\\nAccount summary:\\n";
    for (const auto& account : accounts) {
        std::cout << "- " << account.owner() << ": $" << account.balance() << "\\n";
    }

    return 0;
}
`
  },
  {
    id: 'cpp-stl',
    title: 'STL Algorithms & Lambdas',
    category: 'Algorithms',
    description: 'Sort products and compute inventory value with STL algorithms',
    language: 'cpp',
    code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

struct Product {
    std::string name;
    double price;
    int stock;
};

int main() {
    std::vector<Product> products = {
        {"Laptop", 1200.0, 4},
        {"Headphones", 199.0, 12},
        {"Keyboard", 130.0, 7},
        {"Monitor", 320.0, 5},
    };

    std::sort(products.begin(), products.end(),
              [](const Product& a, const Product& b) { return a.price < b.price; });

    std::cout << "Products by price:\\n";
    for (const auto& product : products) {
        std::cout << "  " << product.name << " - $" << product.price << "\\n";
    }

    double inventoryValue = std::accumulate(
        products.begin(), products.end(), 0.0,
        [](double total, const Product& product) {
            return total + product.price * product.stock;
        });

    auto expensive = std::find_if(products.begin(), products.end(),
                                  [](const Product& product) {
                                      return product.price > 300;
                                  });

    std::cout << "\\nInventory value: $" << inventoryValue << "\\n";
    if (expensive != products.end()) {
        std::cout << "First product over $300: " << expensive->name << "\\n";
    }

    return 0;
}
`
  },
  {
    id: 'cpp-fibonacci',
    title: 'Fibonacci & Chrono Benchmark',
    category: 'Algorithms',
    description: 'Time naive recursion against a memoized implementation',
    language: 'cpp',
    code: `#include <chrono>
#include <iostream>

long long fib_naive(int n) {
    return n <= 1 ? n : fib_naive(n - 1) + fib_naive(n - 2);
}

long long fib_memo(int n) {
    static long long memo[100] = {};
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];
    return memo[n] = fib_memo(n - 1) + fib_memo(n - 2);
}

int main() {
    const int N = 35;

    auto start = std::chrono::steady_clock::now();
    long long naive = fib_naive(N);
    auto naiveMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - start).count();

    start = std::chrono::steady_clock::now();
    long long memo = fib_memo(N);
    auto memoMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - start).count();

    std::cout << "Fibonacci(" << N << ") = " << naive << "\\n";
    std::cout << "Naive recursive: " << naiveMs << " ms\\n";
    std::cout << "Memoized       : " << memoMs << " ms\\n";
    std::cout << "Match          : " << (naive == memo ? "yes" : "no") << "\\n";

    return 0;
}
`
  },
  {
    id: 'cpp-pattern',
    title: 'Star Pyramid & Multiplication Table',
    category: 'Fun & Utility',
    description: 'Build text patterns with strings and formatted stream output',
    language: 'cpp',
    code: `#include <iomanip>
#include <iostream>
#include <string>

int main() {
    const int height = 5;

    std::cout << "Star pyramid:\\n";
    for (int row = 1; row <= height; ++row) {
        std::cout << std::string(height - row, ' ')
                  << std::string(row * 2 - 1, '*') << "\\n";
    }

    std::cout << "\\n5 x 5 multiplication table:\\n";
    for (int row = 1; row <= 5; ++row) {
        for (int col = 1; col <= 5; ++col) {
            std::cout << std::setw(4) << row * col;
        }
        std::cout << "\\n";
    }

    return 0;
}
`
  }
];

const C_SNIPPETS: Snippet[] = [
  {
    id: 'c-hello',
    title: 'Hello World & printf',
    category: 'Beginner',
    description: 'Print strings, numbers and formatted values with printf',
    language: 'c',
    code: `#include <stdio.h>

int main(void) {
    const char *name = "Boss Lab";
    const char *languages[] = {"C", "C++", "Python", "JavaScript"};
    const int count = 4;

    printf("Hello from %s!\\n", name);
    printf("C can do math: 7 * 6 = %d\\n\\n", 7 * 6);

    printf("Languages I can run:\\n");
    for (int i = 0; i < count; i++) {
        printf("  %d. %s\\n", i + 1, languages[i]);
    }

    printf("\\nFormatted: %8.2f | %04d | %s\\n", 3.14159, 42, "done");
    return 0;
}
`
  },
  {
    id: 'c-arrays',
    title: 'Arrays & Loops',
    category: 'Data Structures',
    description: 'Calculate totals, averages and the highest score with arrays',
    language: 'c',
    code: `#include <stdio.h>

int main(void) {
    int scores[] = {88, 92, 79, 95, 84, 90};
    int count = (int)(sizeof(scores) / sizeof(scores[0]));
    int total = 0;
    int highest = scores[0];

    for (int i = 0; i < count; i++) {
        total += scores[i];
        if (scores[i] > highest) {
            highest = scores[i];
        }
    }

    printf("Scores:");
    for (int i = 0; i < count; i++) {
        printf(" %d", scores[i]);
    }
    printf("\\n");

    printf("Count  : %d\\n", count);
    printf("Highest: %d\\n", highest);
    printf("Average: %.2f\\n", (double)total / count);

    return 0;
}
`
  },
  {
    id: 'c-structs',
    title: 'Structs & Functions',
    category: 'Beginner',
    description: 'Group student data in structs and pass them to helper functions',
    language: 'c',
    code: `#include <stdio.h>
#include <string.h>

typedef struct {
    char name[32];
    int age;
    float score;
} Student;

void print_student(const Student *student) {
    printf("  %-10s | age %2d | score %.1f\\n",
           student->name, student->age, student->score);
}

int main(void) {
    Student students[3];

    strcpy(students[0].name, "Alex");
    students[0].age = 20;
    students[0].score = 88.5f;

    strcpy(students[1].name, "Sarah");
    students[1].age = 22;
    students[1].score = 94.0f;

    strcpy(students[2].name, "Rahim");
    students[2].age = 21;
    students[2].score = 79.5f;

    printf("Student report:\\n");
    float total = 0;
    for (int i = 0; i < 3; i++) {
        print_student(&students[i]);
        total += students[i].score;
    }

    printf("\\nClass average: %.1f\\n", total / 3);
    return 0;
}
`
  },
  {
    id: 'c-pointers',
    title: 'Pointers & Dynamic Memory',
    category: 'Data Structures',
    description: 'Allocate an array with malloc, walk it with pointers and free it',
    language: 'c',
    code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int count = 5;
    int *numbers = malloc(count * sizeof(int));

    if (numbers == NULL) {
        printf("Memory allocation failed\\n");
        return 1;
    }

    for (int i = 0; i < count; i++) {
        numbers[i] = (i + 1) * (i + 1);
    }

    printf("Dynamic array values:\\n");
    for (int i = 0; i < count; i++) {
        printf("  numbers[%d] = %d (address %p)\\n",
               i, numbers[i], (void *)&numbers[i]);
    }

    int *cursor = numbers;
    printf("\\nPointer walk: ");
    for (int i = 0; i < count; i++) {
        printf("%d ", *cursor);
        cursor++;
    }
    printf("\\n");

    free(numbers);
    numbers = NULL;
    printf("Memory freed safely.\\n");

    return 0;
}
`
  },
  {
    id: 'c-fibonacci',
    title: 'Fibonacci: Iterative vs Recursive',
    category: 'Algorithms',
    description: 'Compare two Fibonacci implementations and time them with clock',
    language: 'c',
    code: `#include <stdio.h>
#include <time.h>

long long fib_naive(int n) {
    return n <= 1 ? n : fib_naive(n - 1) + fib_naive(n - 2);
}

long long fib_iterative(int n) {
    long long a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        long long next = a + b;
        a = b;
        b = next;
    }
    return a;
}

int main(void) {
    const int n = 35;

    clock_t start = clock();
    long long naive = fib_naive(n);
    double naive_ms = 1000.0 * (clock() - start) / CLOCKS_PER_SEC;

    start = clock();
    long long iterative = fib_iterative(n);
    double iterative_ms = 1000.0 * (clock() - start) / CLOCKS_PER_SEC;

    printf("Fibonacci(%d) = %lld\\n", n, naive);
    printf("Naive recursive: %.2f ms\\n", naive_ms);
    printf("Iterative      : %.2f ms\\n", iterative_ms);
    printf("Match          : %s\\n", naive == iterative ? "yes" : "no");

    return 0;
}
`
  },
  {
    id: 'c-pattern',
    title: 'Star Pyramid & Multiplication Table',
    category: 'Fun & Utility',
    description: 'Draw a pyramid and a multiplication table with nested loops',
    language: 'c',
    code: `#include <stdio.h>

int main(void) {
    const int height = 5;

    printf("Star pyramid:\\n");
    for (int row = 1; row <= height; row++) {
        for (int space = 0; space < height - row; space++) {
            putchar(' ');
        }
        for (int star = 0; star < row * 2 - 1; star++) {
            putchar('*');
        }
        putchar('\\n');
    }

    printf("\\n5 x 5 multiplication table:\\n");
    for (int row = 1; row <= 5; row++) {
        for (int col = 1; col <= 5; col++) {
            printf("%4d", row * col);
        }
        putchar('\\n');
    }

    return 0;
}
`
  }
];

export const DEFAULT_SNIPPETS: Snippet[] = [
  ...JAVASCRIPT_SNIPPETS.map((snippet) => ({ ...snippet, language: 'javascript' as const })),
  ...PYTHON_SNIPPETS,
  ...CPP_SNIPPETS,
  ...C_SNIPPETS,
];
