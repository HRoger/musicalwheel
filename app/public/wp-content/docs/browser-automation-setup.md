# Browser Automation Setup Guide

**Last Updated:** February 2026
**Environment:** WSL2 + Windows LocalWP
**Purpose:** Browser automation for testing MusicalWheel frontend blocks and admin interfaces

---

## Overview: Two Tools Available

This project uses **two browser automation tools**. Choose based on your environment and task:

| Tool | Platform | Best For |
|------|----------|----------|
| **agent-browser** | WSL only | Quick screenshots, simple navigation |
| **Playwright MCP** | WSL + Windows | Parity audits, complex interactions, precise DOM inspection |

**Authentication for all local sites:**

| Field | Value |
|-------|-------|
| **Username** | `Roger` |
| **Password** | `admin` |

---

## Part 1: agent-browser (WSL Only)

### What is agent-browser?

A CLI tool for programmatic browser automation built on Chromium. **Only available inside WSL** — not installed on Windows.

### Installation

```bash
npm install -g agent-browser
```

**Verify:**
```bash
agent-browser --version
```

### WSL Networking Setup (Required)

Agent-browser runs in WSL but needs to reach your LocalWP site on Windows. This requires **Mirrored Networking Mode**.

#### 1. Enable Mirrored Networking (Windows)

Edit `C:\Users\{your-username}\.wslconfig`:

```ini
[wsl2]
dnsProxy=false
networkingMode=Mirrored

[experimental]
sparseVhd=true
```

Then restart WSL:
```powershell
wsl --shutdown
```

#### 2. Update /etc/hosts in WSL

```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1 musicalwheel.local
```

**Verify:**
```bash
ping musicalwheel.local
# Expected: PING musicalwheel.local (127.0.0.1)
```

#### 3. Configure WSL Interop (`/etc/wsl.conf`)

```bash
sudo nano /etc/wsl.conf
```

```ini
[boot]
systemd=true

[automount]
enabled = true
options = "metadata,umask=22,fmask=11,noatime"
mountFsTab = true

[interop]
enabled = true
appendWindowsPath = true
```

Restart WSL after saving.

### Standard Launch Command

```bash
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH" && /usr/bin/agent-browser close 2>/dev/null && /usr/bin/agent-browser --args "--no-sandbox" --headed --ignore-https-errors open [URL] && /usr/bin/agent-browser set viewport 1892 899 && /usr/bin/agent-browser wait --load networkidle 2>&1
```

**Example:**
```bash
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH" && /usr/bin/agent-browser close 2>/dev/null && /usr/bin/agent-browser --args "--no-sandbox" --headed --ignore-https-errors open "https://musicalwheel.local/" && /usr/bin/agent-browser set viewport 1892 899 && /usr/bin/agent-browser wait --load networkidle 2>&1
```

**Flag reference:**

| Flag | Purpose |
|------|---------|
| `--args "--no-sandbox"` | Required for WSL — Chromium sandboxing |
| `--headed` | Show visible browser window |
| `--ignore-https-errors` | Accept LocalWP self-signed certificates |
| `set viewport 1892 899` | Inner viewport (outer: 1900x1032) |

### Core Workflow

```bash
agent-browser snapshot -i              # Get interactive elements (@e1, @e2...)
agent-browser click @e1                # Click by ref
agent-browser fill @e2 "text"          # Fill input
agent-browser screenshot --full        # Full page screenshot
agent-browser get url                  # Get current URL
agent-browser get text body            # Get page text
agent-browser wait --load networkidle  # Wait for page load
agent-browser close                    # Close browser
```

### Viewport Sizes

```bash
agent-browser set viewport 1892 899     # Default (outer: 1900x1032)
agent-browser set viewport 1920 1080    # 1080p
agent-browser set viewport 2560 1440    # 1440p
agent-browser set viewport 1366 768     # Laptop
```

### Troubleshooting

**`net::ERR_CONNECTION_REFUSED`**
- Enable Mirrored Networking Mode in Windows Settings
- Check `/etc/hosts` in WSL contains `127.0.0.1 musicalwheel.local`
- Verify LocalWP is running

**`--args ignored: daemon already running`**
```bash
agent-browser close 2>/dev/null || true
sleep 1
# Then re-run your open command
```

**Browser window not visible**
```bash
export DISPLAY=:0
```

---

## Part 2: Playwright MCP (WSL + Windows)

### What is Playwright MCP?

A registered MCP server that exposes Playwright browser automation as native Claude Code tools. **Works on both WSL and Windows** — no Bash commands needed, tools are called directly.

### Installation

#### Step 1: Register the MCP server

```bash
claude mcp add playwright -- npx @playwright/mcp@latest --ignore-https-errors --viewport-size "1892,899"
```

This is already registered for this project in `/home/roger/.claude.json`:

```json
{
  "playwright": {
    "type": "stdio",
    "command": "npx",
    "args": ["@playwright/mcp@latest", "--ignore-https-errors", "--viewport-size", "1892,899"]
  }
}
```

> **`--viewport-size "1892,899"`** — Sets the default viewport at launch so the browser always opens at the correct size. Without this, Chrome defaults to ~1280px wide.

#### Step 2: Install Chrome browser

Run this in WSL terminal:

```bash
npx playwright install chrome
```

> If you get a lockfile error: `rm -rf ~/.cache/ms-playwright/__dirlock` then retry.

#### Step 3: Restart Claude Code session

The MCP server loads at session start — restart to activate.

### Available Tools

| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Navigate to a URL |
| `mcp__playwright__browser_snapshot` | Structured accessibility snapshot |
| `mcp__playwright__browser_click` | Click by CSS selector, text, or aria label |
| `mcp__playwright__browser_fill_form` | Fill form fields precisely |
| `mcp__playwright__browser_take_screenshot` | Take a screenshot |
| `mcp__playwright__browser_resize` | Set viewport size |
| `mcp__playwright__browser_wait_for` | Wait for text or time |
| `mcp__playwright__browser_evaluate` | Run JavaScript on the page |

### Standard Viewport

**1892x899 is baked into the MCP server config** via `--viewport-size "1892,899"`. The browser always launches at the correct size — no manual resize needed.

Use `mcp__playwright__browser_resize` only if you need to temporarily switch to a different breakpoint (e.g. mobile testing).

### Core Workflow

1. **Navigate** → `mcp__playwright__browser_navigate` with the URL
2. **Snapshot** → `mcp__playwright__browser_snapshot` to get page structure
3. **Interact** → `mcp__playwright__browser_click` / `mcp__playwright__browser_fill_form`
4. **Verify** → `mcp__playwright__browser_take_screenshot`

### Why Playwright MCP is Better for Parity Work

- **Stable selectors** — target `.ts-form .ts-filter` instead of drifting `@e3` refs
- **Accessibility tree** — structured snapshot shows roles, names, values
- **Auto-waiting** — no manual `wait --load` needed
- **HTTPS** — `--ignore-https-errors` flag handles LocalWP certificates automatically
- **Form precision** — native browser events for dropdowns, date pickers, multi-step forms
- **Correct viewport by default** — 1892x899 baked into server config, no resize step needed

### Troubleshooting

**`Chromium distribution 'chrome' is not found`**
```bash
npx playwright install chrome
```

**Lockfile error during install**
```bash
rm -rf ~/.cache/ms-playwright/__dirlock
npx playwright install chrome
```

**Certificate warning on musicalwheel.local**
- The `--ignore-https-errors` flag in the MCP registration handles this automatically.
- If it persists, re-register:
```bash
claude mcp remove playwright && claude mcp add playwright -- npx @playwright/mcp@latest --ignore-https-errors --viewport-size "1892,899"
```

**Browser opens at wrong size (e.g. 1280px)**
- The `--viewport-size` flag is not set. Re-register using the command above.

---

## WSL Networking Architecture

```
┌─────────────────────────────────────────────────────┐
│ Windows (Host)                                      │
│  LocalWP → musicalwheel.local:443                   │
│  C:\Windows\System32\drivers\etc\hosts              │
│  127.0.0.1 musicalwheel.local                       │
└──────────────────┬──────────────────────────────────┘
                   ↕ Mirrored Networking Mode
┌──────────────────┴──────────────────────────────────┐
│ WSL2 (Linux)                                        │
│  agent-browser → /usr/bin/agent-browser (Chromium)  │
│  Playwright MCP → npx @playwright/mcp (Chrome)      │
│  /etc/hosts: 127.0.0.1 musicalwheel.local           │
└─────────────────────────────────────────────────────┘
```

---

## Quick Decision Guide

```
Need a quick screenshot or simple page load?
  → Use agent-browser (if on WSL)

Doing a parity audit or DOM comparison?
  → Use Playwright MCP

Filling a complex form or testing Gutenberg editor?
  → Use Playwright MCP

Running on Windows VSCode (not WSL)?
  → Use Playwright MCP (agent-browser not available)
```

---

## References

- `CLAUDE.md` Section 12 — Browser Automation (Dual-Tool System)
- `CLAUDE.md` Section 12 — Authentication credentials
