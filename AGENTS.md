<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## Commands

- **Build + Restart (Docker)**: `npm run build && sudo docker compose up -d --build`
- **Build only**: `npm run build`
- **View logs**: `sudo docker compose logs -f`
- **Tests**: `npm test`
- **Test middleware**: `node --test test/middleware.test.mjs`
