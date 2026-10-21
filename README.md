# 🧪 Boss Lab – JS Console

A browser-based JavaScript playground where you can write code in a real code editor, run it, and see the output instantly. Built with React, TypeScript and Vite, with Gemini AI support.

🔗 **Live Demo:** [boss-lab-js-console.vercel.app](https://boss-lab-js-console.vercel.app)

---

## ✨ Features

- 📝 **Code editor** powered by Monaco (the same editor used in VS Code)
- ▶️ **Run JavaScript** and see the console output right in the browser
- 🤖 **AI support** using the Google Gemini API
- 🎨 **Clean, responsive UI** styled with Tailwind CSS
- 🎞️ **Smooth animations** with Motion
- ⚡ **Fast development and build** with Vite

---

## 🛠️ Tech Stack

| Category   | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | React 19, TypeScript           |
| Build Tool | Vite                           |
| Styling    | Tailwind CSS v4                |
| Editor     | Monaco Editor                  |
| AI         | Google Gemini API (`@google/genai`) |
| Icons      | Lucide React                   |
| Animation  | Motion                         |
| Hosting    | Vercel (with Analytics & Speed Insights) |

---

## 📁 Project Structure

```
Boss-Lab--JS-Console/
├── src/                # Application source code
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
├── .env.example        # Example environment variables
└── metadata.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mdsolimansikder7/Boss-Lab--JS-Console.git
   cd Boss-Lab--JS-Console
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example file and add your own key:

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and fill in:

   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Starts the dev server on port 3000    |
| `npm run build`   | Creates a production build            |
| `npm run preview` | Previews the production build locally |
| `npm run lint`    | Checks TypeScript types               |

---

## ☁️ Deployment

This project is deployed on **Vercel**.

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/)
3. Add `GEMINI_API_KEY` in **Project Settings → Environment Variables**
4. Deploy 🎉

> ⚠️ Never commit your real `.env` file or API key to GitHub.

---

## 🤝 Contributing

Suggestions and improvements are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Md Soliman Sikder**

- GitHub: [@mdsolimansikder7](https://github.com/mdsolimansikder7)
- LinkedIn: [md-soliman-sikder](https://www.linkedin.com/in/md-soliman-sikder-b17887237)

---

⭐ If you like this project, give it a star!
