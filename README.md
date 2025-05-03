# Medieval Times 🏰

**Medieval Times**, a TypeScript-powered medieval crier. This project serves as a medieval-inspired news crier, leveraging AI to announce daily news headlines in a unique and entertaining format.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)

## Overview

**Medieval Times** combines the following:
- An RSS news feed parser to fetch the latest headlines.
- OpenAI GPT-powered text generation to rewrite headlines as a medieval town crier would.
- Integration with BlueSky for posting these rewritten headlines.

The project aims to deliver daily news updates with a touch of medieval flair, making current events more engaging and whimsical.

### Technology Stack
- **Language**: TypeScript
- **Key Libraries and APIs**:
  - `@atproto/api` for BlueSky integration.
  - `dotenv` for environment variable management.
  - `rss-to-json` for RSS feed parsing.
  - `openai` for GPT-based text generation.

---

## Features

- **News Fetching**: Fetches the latest news headlines from Google News RSS feeds.
- **AI-Powered Rewriting**: Transforms headlines into medieval-style announcements using GPT.
- **BlueSky Posting**: Posts these announcements to a BlueSky account.
- **Customizable Prompts**: Allows modifications to the style and tone of the AI-generated text.
- **Daily Automation**: Schedules daily updates using a cron job.

---

## Installation

To set up this project locally, follow these steps:

1. Clone the repository:  
   ```bash
   git clone https://github.com/seth-wood/medieval-times.git
   cd medieval-times
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Set up environment variables:  
   Create a `.env` file in the root directory with the following keys:
   ```
   BLUESKY_USERNAME=your_bluesky_username
   BLUESKY_PASSWORD=your_bluesky_password
   OPENAI_KEY=your_openai_api_key
   ```

4. Run the project:  
   ```bash
   deno run --allow-net --allow-env main.ts
   ```

---

## Usage

1. **Fetch and Announce News**:  
   The main script fetches news headlines, rewrites them in a medieval style, and posts them to BlueSky. Simply run:
   ```bash
   deno run --allow-net --allow-env main.ts
   ```

2. **Schedule Daily Updates**:  
   The project includes a cron job that automates the process daily:
   ```bash
   Deno.cron("everymorning", "30 12 * * *", main);
   ```

3. **Testing**:  
   Run tests using Deno:
   ```bash
   deno test
   ```

---

## Contributing

Contributions are welcome! 🎉

To contribute:

1. Fork the repository.
2. Create a new branch:  
   ```bash
   git checkout -b feature-name
   ```

3. Commit your changes:  
   ```bash
   git commit -m "Add some feature"
   ```

4. Push your branch:  
   ```bash
   git push origin feature-name
   ```

5. Open a pull request.

---

## License

This project is currently unlicensed. For any inquiries about usage or redistribution, please contact the repository owner.

---
