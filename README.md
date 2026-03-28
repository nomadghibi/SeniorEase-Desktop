# SeniorEase Desktop

SeniorEase Desktop is a senior-first Windows launcher built with Electron, React, TypeScript, and Tailwind CSS.

This repository currently contains the Phase 1 MVP scaffold:
- fullscreen launcher shell
- large-button home screen with 7 modules
- persistent bottom navigation (`Home`, `Back`, `Speak`, `Help`)
- placeholder module screens for Email, Photos, Internet, Facebook, Video Call, Family, and Help
- accessibility-first spacing, contrast, and typography choices

## Project Structure

```txt
seniorease-desktop/
|- app/        # Electron + React desktop launcher
|- bridge/     # Reserved for Phase 2 local bridge service
|- docs/       # Product and architecture docs
```

## Run Locally (Windows + VS Code)

1. Open VS Code.
2. Open folder: `C:\Users\<you>\Documents\seniorease-desktop\app`
3. In VS Code terminal:

```powershell
npm install
npm run dev
```

4. The Electron window should open in fullscreen.

## Build for Local Testing

```powershell
npm run build
npm run start
```

## Notes

- This is a UI scaffold only. It does **not** include OpenClaw or backend bridge logic yet.
- Voice actions are placeholder-only in Phase 1.
- Risky task automation is intentionally not implemented in this phase.
