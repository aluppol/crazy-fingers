# Crazy Fingers

A browser typing trainer in the spirit of the classic "solo on the keyboard" courses: pick a book, type it character by character, and come back later to exactly the place you left. Everything stays in your browser — no accounts, no server.

**Add your own texts:** `.txt`, `.md`, `.html`, `.epub`, `.fb2`, `.docx`, `.pdf`, or paste text directly. Books are split into chapters (from the document structure when it has one, by heading heuristics otherwise), and you can start from any chapter.

Live: https://albert.luppol.com/crazy-fingers/

## Development

```
yarn dev        # serve on http://localhost:4200
yarn test       # vitest, single run
yarn lint       # eslint
yarn typecheck  # tsc over app and spec configs
yarn build      # production build into dist/
```
