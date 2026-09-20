---
title: PromptShell
subtitle: "AI-Powered Terminal Autobot — Speak to Your Machine"
badge: "Active Development"
role: "Sole Author & Architect"
period: "2025"
status: active
featured: false
tags:
  - C#
  - .NET 9
  - Avalonia UI
  - MVVM
  - LLM
  - RAG (man pages)
  - Ollama
  - Desktop App
  - macOS
  - Cross-Platform
githubUrl: "https://github.com/csabisoos/PromptShell"
description: >
  PromptShell is an intelligent, cross-platform desktop autobot that bridges
  human intent and terminal execution. Type plain English — it generates the
  exact shell command, asks for clarification if ambiguous, guards against
  destructive operations, and interprets raw output into plain language.
  Built with .NET 9 + Avalonia UI using strict MVVM and Clean Code principles.
architecturePillars:
  - icon: "🗣️"
    title: "Natural Language → Shell Command"
    description: "The AiInferenceService sends a strict system prompt to a local or cloud LLM (Ollama Llama 3 / Groq / ONNX Runtime) that responds with a single executable command — no markdown, no explanations. A second pass interprets the terminal output back into human language."
    tags: ["C#", "HttpClient", "Ollama", "System.Text.Json"]
  - icon: "📖"
    title: "RAG man-page Grounding"
    description: "Before inference, PromptShell reads the system manual (man page) of the inferred CLI tool via /usr/bin/man, truncates it to 1200 chars, and injects it as context — ensuring generated flags and arguments are OS-accurate and never hallucinated."
    tags: ["RAG", "man pages", "System.Diagnostics.Process", "zsh"]
  - icon: "🛡️"
    title: "Multi-Tier Safety Guard"
    description: "Destructive keywords (rm, sudo, >>) are caught before execution. An AI clarification protocol fires when the request is ambiguous — the model responds with '?' prefix to pause and query the user before touching the filesystem."
    tags: ["Safety Guard", "Intent Detection", "Two-Way AI", "MVVM CommunityToolkit"]
metrics:
  - label: "Target platforms"
    value: "macOS + Win"
  - label: "Framework"
    value: ".NET 9"
  - label: "AI providers"
    value: "3 modes"
  - label: "Safety tiers"
    value: "Multi-tier"
scenarios:
  - id: "natural-command"
    title: "\"clean up my workspace\" → shell command"
    outcome: "clear"
    summary: "User types plain English. AiInferenceService scans the active directory context, reads the relevant man page, and resolves the intent to a precise shell command. The AI renders an Action Card — [ Approve ] [ Cancel ] — before touching the filesystem."
  - id: "ambiguous-request"
    title: "\"build\" with multiple solution files present"
    outcome: "alert"
    summary: "When 'build' is typed but PromptShell detects multiple .sln or Makefile targets in the working directory, the AI returns '? Which project should I build: PromptShell.sln or Tests.csproj?' — zero guessing, zero wrong commands."
  - id: "destructive-guard"
    title: "Command contains rm or sudo"
    outcome: "alert"
    summary: "Multi-tier safety guard intercepts the generated command. Execution is paused and the user is shown the exact command with a manual approval prompt. The raw terminal output and exit code are then interpreted back into human-readable feedback."
---

## The Problem: The CLI Knowledge Gap

The terminal is the most powerful tool on any computer — but its power is locked behind thousands of cryptic flags, tool-specific syntax, and OS-version differences. The average developer wastes minutes per day hunting through man pages or Stack Overflow to construct a single correct command. For non-developers, the terminal is simply off-limits.

PromptShell eliminates this knowledge gap entirely.

## Solution: The Intelligent Desktop Autobot

PromptShell acts as an invisible co-pilot sitting between human intent and shell execution. You type what you want to achieve in plain English. PromptShell:

1. **Understands context** — scans your active directory, reads your project structure.
2. **Grounds itself** — reads the actual system man page for the inferred CLI tool.
3. **Generates precisely** — produces one executable command, no markdown, no fluff.
4. **Guards safety** — pauses for manual approval on any destructive keyword.
5. **Explains the result** — interprets terminal output back into plain language.

## Technical Architecture

### Technology Stack

| Layer | Technology |
|---|---|
| Desktop Framework | Avalonia UI 12.0 (XAML) |
| Runtime | .NET 9.0 |
| UI Pattern | MVVM — CommunityToolkit.Mvvm 8.4 |
| Compilation | CompiledBindings (Avalonia) |
| AI — Local | Ollama HTTP API (`/api/generate`) |
| AI — Cloud | Custom API / Groq (OpenAI-compatible) |
| AI — Offline | ONNX Runtime + Microsoft Phi-3 (planned) |
| Shell Execution | `System.Diagnostics.Process` → `/bin/zsh -c` |
| Manual Grounding | `/usr/bin/man` subprocess → string injection |
| Data Models | `AppSettings`, `ChatMessage`, `TerminalResult` |
| Target Platforms | macOS (Apple Silicon + Intel), Windows |

### Service Architecture (Clean Code / SoC)

```
User Input
    │
    ▼
MainWindowViewModel (MVVM — CommunityToolkit.Mvvm)
    │
    ├─► AiInferenceService.GenerateCommandAsync()
    │       │
    │       ├─ 1. Extract first word → GetTerminalManualAsync() → man page context
    │       ├─ 2. Assemble: [DIRECTORY CONTEXT] + [MANUAL] + [USER REQUEST]
    │       ├─ 3. Route to: Ollama | CustomApi | Proxy
    │       └─ 4. Return raw command string (or '?' clarification)
    │
    ├─► Safety Guard — destructive keyword detection (rm, sudo, >>)
    │       └─ If flagged → ActionCardChatMessage (Approve / Cancel)
    │
    ├─► TerminalService.ExecuteCommandAsync()
    │       └─ Process: /bin/zsh -c {command} → TerminalResult (stdout, stderr, exitCode)
    │
    └─► AiInferenceService.InterpretResultAsync()
            └─ Translate raw output + exit code → 1-2 sentence human summary
```

### AI Provider Routing

`AppSettings.AiProvider` controls the inference backend at runtime — no restart required:

| Mode | Endpoint | Use case |
|---|---|---|
| `Ollama` (default) | `http://localhost:11434/api/generate` | Free, private, local |
| `CustomApi` | User-configured (e.g. Groq) | BYO API key, cloud speed |
| `Proxy` | Shared token proxy | Zero-config, out-of-box |
| `OfflineOnnx` *(planned)* | ONNX Runtime local | Air-gapped, no Ollama needed |

### RAG man-page Grounding Detail

```csharp
// AiInferenceService.cs — before every GenerateCommandAsync call
string firstWord = userPrompt.Trim().Split(' ')[0].ToLower();
if (firstWord.Length > 1 && !firstWord.StartsWith("."))
{
    manualContext = await GetTerminalManualAsync(firstWord);
    // → Spawns /usr/bin/man {firstWord}, captures stdout
    // → Truncates to 1200 chars, injects as [MANUAL FOR 'git'] context
}
```

This ensures that generated `git`, `docker`, `dotnet`, and `npm` flags exactly match what your OS version supports — eliminating the hallucination problem for CLI arguments.

### Chat Message Type System

PromptShell's UI is built around a polymorphic chat message model:

- **`UserChatMessage`** — user's plain-language request bubble
- **`AiChatMessage`** — AI response with optional `RawTechnicalDetails` expander (the actual shell command + output)
- **`ActionCardChatMessage`** — interactive approval card with `PendingCommand`, `[ Approve ]` and `[ Cancel ]` buttons
- **`SystemChatMessage`** — status events (directory changed, safety alert triggered)

## Upcoming: The Autobot UI Transformation

The current developer dashboard UI is being replaced by a **full chatbot/bubble interface** (Avalonia XAML redesign):

- **Central bubble chat panel** — clean conversation history (ChatGPT-style)
- **Interactive action cards** — `🛠️ PromptShell wants to build your project. [ Approve ] [ Cancel ]`
- **Expander blocks** — `▼ Show raw output / technical details` slides down a dark terminal container
- **Zero jargon surface** — raw exit codes, green terminals, and process errors hidden from plain sight

## Platform & Deployment

Built as a **self-contained single-file binary** via `dotnet publish`:

```bash
dotnet publish -r osx-arm64 --self-contained true \
  /p:PublishSingleFile=true /p:PublishTrimmed=true
```

Targets: `osx-arm64` (Apple Silicon M1/M2/M3), `osx-x64` (Intel Mac), `win-x64` (Windows).
Ships as a native macOS `.app` bundle (`PromptShell.app/Contents/MacOS/`) with `Info.plist` and `.icns` icon.

> *"PromptShell is built to make computing accessible, automated, and secure. Stay tuned as we build the future of desktop interaction!"*
