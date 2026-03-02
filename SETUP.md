# Run This Project Locally (localhost:3000)

## Step 1: Install Node.js and npm

You need Node.js (npm is included). Two options:

### Option A: Homebrew (recommended on Mac)

In Terminal:

```bash
# Install Homebrew (one-time; prompts for your password)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to your PATH (for Apple Silicon Macs it shows the path at end of install)
# Typical for M1/M2: echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile && eval "$(/opt/homebrew/bin/brew shellenv)"

# Install Node.js
brew install node

# Verify
node --version
npm --version
```

### Option B: Direct download

1. Go to https://nodejs.org
2. Download the LTS version for macOS
3. Run the installer
4. Restart Terminal
5. Run `node --version` and `npm --version` to confirm

---

## Step 2: Install dependencies and run

```bash
cd /Users/ronnoche/pdf-typing-practice

# Install project dependencies
npm install

# Start dev server (runs at http://localhost:3000)
npm run dev
```

Open http://localhost:3000 in your browser.
