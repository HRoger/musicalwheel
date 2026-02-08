# Agent-Browser Installation & Setup Guide

**Last Updated:** February 2026
**Environment:** WSL2 + Windows LocalWP
**Purpose:** Browser automation for testing MusicalWheel frontend blocks and admin interfaces

---

## 1. What is agent-browser?

**agent-browser** is a CLI tool for programmatic browser automation built on Playwright/Chromium. It enables:

- ✅ Navigate to URLs and take screenshots
- ✅ Fill forms, click buttons, interact with elements
- ✅ Extract page structure and element references
- ✅ Monitor network traffic and console logs
- ✅ Test responsive layouts across viewports
- ✅ Automate admin panel testing

**Key Advantage:** Works seamlessly in WSL2 to test your LocalWP WordPress site running on Windows.

---

## 2. Installation

### Step 1: Install agent-browser globally via npm

```bash
npm install -g agent-browser
```

**Verify installation:**
```bash
agent-browser --version
```

### Step 2: Configure WSL2 Networking (CRITICAL)

Agent-browser runs in WSL2 but needs to access your LocalWP site on Windows. This requires **Mirrored Networking Mode**.

#### Enable Mirrored Networking in Windows Settings:

1. Open **Settings** → **System** → **Development**
2. Find **WSL Networking**
3. Enable **Mirrored Networking Mode**
4. Click **Save** and restart WSL

**Why?** Default WSL networking uses a virtual NAT that isolates WSL from Windows. Mirrored mode bridges the gap.

### Step 3: Update /etc/hosts in WSL

Add your LocalWP domain(s) to WSL's hosts file so DNS resolves locally:

```bash
# Add to /etc/hosts in WSL
127.0.0.1 musicalwheel.local
127.0.0.1 example.local
```

**Edit with:**
```bash
# Using nano
sudo nano /etc/hosts

# Using vi
sudo vi /etc/hosts
```

**Verify:**
```bash
ping musicalwheel.local
# Expected: PING musicalwheel.local (127.0.0.1) ...
```

### Step 4: Update Windows hosts file (Optional but Recommended)

For consistency, also add to Windows hosts file:

**File location:** `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 musicalwheel.local
127.0.0.1 example.local
```

**Edit as Administrator:**
1. Open Notepad as Administrator
2. File → Open → `C:\Windows\System32\drivers\etc\hosts`
3. Add entries at the end
4. Save and close

### Step 5: Configure Claude Code Environment

Add agent-browser configuration to your `.claude/settings.local.json`:

```json
{
  "env": {
    "DISPLAY": ":0",
    "AGENT_BROWSER_STREAM_PORT": "9223",
    "LIBGL_ALWAYS_INDIRECT": "0"
  },
  "permissions": {
    "allow": [
      "Bash(/usr/bin/agent-browser:*)",
      "Bash(agent-browser:*)"
    ]
  }
}
```

**Explanation:**
- `DISPLAY=":0"` - X11 display server for GUI forwarding
- `AGENT_BROWSER_STREAM_PORT="9223"` - WebSocket port for browser streaming
- `LIBGL_ALWAYS_INDIRECT="0"` - OpenGL rendering (prevents blurry graphics)

### Step 6: Update ~/.bashrc (Optional)

For convenient command execution, add these to your `~/.bashrc`:

```bash
# Agent-browser configuration
export DISPLAY=":0"
# export AGENT_BROWSER_STREAM_PORT=9223  # Uncomment if using streaming
export LIBGL_ALWAYS_INDIRECT=0

# Unset to use system Chromium (recommended for WSL)
unset AGENT_BROWSER_EXECUTABLE_PATH

# Claude Code function (if using Claude CLI)
claude() {
  PATH="/home/roger/.local/bin:$PATH" command /home/roger/.local/bin/claude "$@"
}
```

---

## 3. Quick Start

### Launch Browser to Your Site

```bash
agent-browser --args "--no-sandbox" --headed open http://musicalwheel.local/
```

**Flags explained:**
- `--args "--no-sandbox"` - **REQUIRED for WSL** (Chromium needs this in WSL environment)
- `--headed` - Show browser window visually
- `http://musicalwheel.local/` - Target URL

### Set Viewport Size

```bash
agent-browser set viewport 1920 1080
```

**Common sizes:**
```bash
agent-browser set viewport 1920 1080    # 1080p
agent-browser set viewport 2560 1440    # 1440p (QHD)
agent-browser set viewport 1366 768     # 768p laptop
```

### Take a Screenshot

```bash
agent-browser screenshot --full
# Screenshot saved to: ./screenshot.jpeg
```

### Get Page Structure (Interactive Elements)

```bash
agent-browser snapshot -i
# Returns: @e1 (button), @e2 (input), etc. with element details
```

### Interact with Elements

```bash
# Click element
agent-browser click @e1

# Fill input
agent-browser fill @e2 "search term"

# Press key
agent-browser press Enter

# Type text
agent-browser type "hello world"
```

### Close Browser

```bash
agent-browser close
```

---

## 4. Common Commands Reference

| Task | Command |
|------|---------|
| **Open browser** | `agent-browser --args "--no-sandbox" --headed open <URL>` |
| **Set viewport** | `agent-browser set viewport 1920 1080` |
| **Take screenshot** | `agent-browser screenshot --full` |
| **Get elements** | `agent-browser snapshot -i` |
| **Click element** | `agent-browser click @e1` |
| **Fill input** | `agent-browser fill @e2 "text"` |
| **Type text** | `agent-browser type "hello"` |
| **Press key** | `agent-browser press Enter` |
| **Reload page** | `agent-browser press F5` |
| **Close browser** | `agent-browser close` |
| **Help** | `agent-browser --help` |

---

## 5. Troubleshooting

### Issue: "Browser not launched. Call launch first."

**Cause:** Command sent before browser is open.

**Solution:**
```bash
# Proper sequence:
agent-browser --args "--no-sandbox" --headed open http://musicalwheel.local/
sleep 2  # Wait for browser to start
agent-browser set viewport 1920 1080
agent-browser snapshot -i
```

### Issue: "net::ERR_CONNECTION_REFUSED" or "net::ERR_CONNECTION_TIMED_OUT"

**Cause:** WSL can't reach Windows localhost or musicalwheel.local not in /etc/hosts.

**Solutions:**
1. Verify Mirrored Networking Mode is enabled in Windows Settings
2. Check /etc/hosts in WSL contains `127.0.0.1 musicalwheel.local`
3. Test connectivity: `ping musicalwheel.local` should return `127.0.0.1`
4. Verify LocalWP is running on Windows

### Issue: "⚠ --args ignored: daemon already running..."

**Cause:** Browser daemon still running from previous session.

**Solution:**
```bash
agent-browser close 2>/dev/null || true
sleep 1
agent-browser --args "--no-sandbox" --headed open http://musicalwheel.local/
```

### Issue: Browser shows 1200px width instead of full viewport

**Cause:** Theme CSS has max-width constraints.

**Solution:** Update theme layout in `theme.json`:
```json
{
  "settings": {
    "layout": {
      "contentSize": "100%",
      "wideSize": "100%"
    }
  }
}
```

Then reload browser.

### Issue: "Google Sign-In blocked" or "This browser or app may not be secure"

**Cause:** Google detects automated Chromium as insecure.

**Solution:** This is expected for Google services in WSL. Use:
- Regular Windows Chrome for Google Sign-In testing
- agent-browser for testing your own sites (MusicalWheel, etc.)

### Issue: Browser window not visible

**Cause:** Missing `DISPLAY` environment variable or X11 server not running.

**Solution:**
```bash
# Set DISPLAY
export DISPLAY=:0

# Or use Claude Code settings.local.json
# See Step 5 above
```

---

## 6. Helper Scripts

Create these bash scripts in `.claude/skills/` for convenience:

### agent-browser-open.sh

```bash
#!/bin/bash
# Usage: agent-browser-open http://musicalwheel.local/ [width] [height]

URL="${1:-http://musicalwheel.local/}"
VIEWPORT_W="${2:-1920}"
VIEWPORT_H="${3:-1080}"

echo "🌐 Opening browser: $URL"
echo "📏 Viewport: ${VIEWPORT_W}x${VIEWPORT_H}"

/usr/bin/agent-browser close 2>/dev/null || true
sleep 1
/usr/bin/agent-browser --args "--no-sandbox" --headed open "$URL"
sleep 2
/usr/bin/agent-browser set viewport "$VIEWPORT_W" "$VIEWPORT_H"

echo "✅ Browser ready!"
```

**Usage:**
```bash
agent-browser-open http://musicalwheel.local/
agent-browser-open http://musicalwheel.local/ 2560 1440
```

### agent-browser-snapshot.sh

```bash
#!/bin/bash
# Usage: agent-browser-snapshot [mode]
# Modes: (default=interactive), full, compact

MODE="${1:-}"

if [ "$MODE" = "full" ]; then
    /usr/bin/agent-browser snapshot
elif [ "$MODE" = "compact" ]; then
    /usr/bin/agent-browser snapshot -c
else
    /usr/bin/agent-browser snapshot -i
fi
```

**Usage:**
```bash
agent-browser-snapshot        # Interactive elements only
agent-browser-snapshot full   # All elements
agent-browser-snapshot compact # Compact view
```

---

## 7. Typical Workflow

**Testing a WordPress block in MusicalWheel:**

```bash
# 1. Open browser to admin page
agent-browser-open http://musicalwheel.local/wp-admin/

# 2. Wait a moment, then get page snapshot
sleep 1
agent-browser-snapshot

# 3. Navigate to specific admin page
agent-browser click @e5  # Click menu item
sleep 1

# 4. Take screenshot to verify layout
agent-browser screenshot --full

# 5. Test responsive at different viewport
agent-browser set viewport 768 1024
agent-browser screenshot --full

# 6. Close when done
agent-browser close
```

---

## 8. WSL Networking Architecture

**How it works with Mirrored Mode:**

```
┌─────────────────────────────────────────────────────┐
│ Windows (Host)                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ LocalWP running musicalwheel.local:80             ││
│ │ C:\Windows\System32\drivers\etc\hosts             ││
│ │ 127.0.0.1 musicalwheel.local                      ││
│ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
           ↕ Mirrored Networking Mode
┌─────────────────────────────────────────────────────┐
│ WSL2 (Linux)                                        │
│ ┌──────────────────────────────────────────────────┐│
│ │ agent-browser (Chromium)                          ││
│ │ /etc/hosts                                        ││
│ │ 127.0.0.1 musicalwheel.local → connects to       ││
│ │ Windows LocalWP                                   ││
│ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Key Point:** With Mirrored Mode, 127.0.0.1 in WSL routes to Windows localhost.

---

## 9. Next Steps

Now that agent-browser is set up, you can:

1. **Test block rendering** - Open WordPress editor and verify FSE blocks display correctly
2. **Test responsive layouts** - Change viewport and screenshot at multiple breakpoints
3. **Automate admin testing** - Click through admin panels to verify controls work
4. **Extract page data** - Use `snapshot` to get element references for automation
5. **Monitor frontend** - Combine with Claude Code for automated testing workflows

**Recommended:** Create `.claude/scripts/test-blocks.sh` to automate block testing workflows.

---

## 10. Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `DISPLAY` | `:0` | X11 display server for GUI forwarding |
| `AGENT_BROWSER_STREAM_PORT` | `9223` | WebSocket port for browser preview streaming |
| `AGENT_BROWSER_EXECUTABLE_PATH` | (unset) | Path to Chromium binary (leave unset for system default) |
| `LIBGL_ALWAYS_INDIRECT` | `0` | OpenGL rendering mode (0 = indirect, prevents blurry) |

**Recommended .bashrc configuration:**
```bash
export DISPLAY=":0"
export LIBGL_ALWAYS_INDIRECT=0
unset AGENT_BROWSER_EXECUTABLE_PATH
# export AGENT_BROWSER_STREAM_PORT=9223  # Only if using streaming
```

---

## Questions?

Refer to:
- `.claude/skills/agent-browser-*.sh` - Helper scripts
- `.claude/settings.local.json` - Environment configuration
- `CLAUDE.md` section 12 - Browser automation best practices
