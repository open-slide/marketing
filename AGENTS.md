# open-slide-marketing

Launch films (`films/<id>/`) and images (`images/<id>/`) for open-slide. See `README.md` for the workspace, rendering, and layout.

- New films via the `create-video` skill, new images via `create-image` (`.claude/skills/`).
- The product itself lives in the open-slide monorepo at `$OPEN_SLIDE_REPO` (default `../../npm/open-slide`). Research features there; `/@repo`, `/@deck`, and image `publish` targets read from or write to it.
- Run `pnpm check` (Biome) before committing.
- Don't start `pnpm dev` or run a master `pnpm render` yourself; the user does.
