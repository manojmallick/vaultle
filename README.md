# Vaultle

Vaultle is a daily colour-sequencing puzzle for desktop browsers, with an experimental WebXR mode. Each day uses a date-based seed to create the same puzzle for every player.

## Play

1. Select two blocks to swap them.
2. Match the target sequence using as few moves as possible.
3. Share the result and keep a local streak.
4. On a compatible headset and browser, try the WebXR mode.

## Develop

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Useful checks and production build:

```bash
pnpm typecheck
pnpm test
pnpm build
```

The puzzle rules and date-seeded generation are in `src/logic/`; the Next.js routes are in `app/`. Puzzle state is stored in the browser. There is no backend or account system.

## License

Licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). This source-available license restricts commercial use; it is not an OSI-approved open-source license. See the license for terms and exceptions. Third-party dependencies retain their own licenses.
