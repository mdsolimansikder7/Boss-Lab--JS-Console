import { Snippet } from '../types';

export const DEFAULT_SNIPPETS: Snippet[] = [
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
