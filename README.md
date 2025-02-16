## Next GdR App

Chat-based RPG app built with Next.js

### Stack:

- Next.js
- React
- Tailwind
- Hero UI
- Drizzle ORM
- Auth.js
- React-draggable
- Zod
- react-rnd

## Developers

### Installation

- Run `npm install`
- Set `DATABASE_URL` in .env
- Run `npx auth secret` to generate an auth secret in .env
- Additional setup for the auth providers

### Guidelines

-

### Features to implement

- [ ] SWR for fetching data
- [x] Zod for validation (should be configurable with drizzle)
- [x] Configurable dictionary
- [ ] More Auth options
- [x] Roled-based access (admin, master, user)
- [x] Movable windows (react-rnd)
- [ ] Error management when calling all server actions (implement toast)
- [x] Catch 404 page without layout
- [x] Build more robust logic for "hasCharacter", maybe linking the property with the character table instead of a boolean
- [x] Add zod validation for new character from (trim, first letter uppercase, rest lowercase, no spaces - base for the rest of the validation)
- [ ] Create game-wide context to save user's state (like character details) so they're available everywhere
- [x] Create logic for character selection (redirect logic already present) and second character creation in the settings
- [ ] Add labels for current pages in the dictionary (always in progress)

### Bugs

- [x] White flashing on route navigation
- [x] Only render the navbar when starts with "/game" but it's also valid
- [ ] Movable will increase height and width limits when pushed on the edges
- [x] Fix positioning of the avatar

### Utils and Docs

- [Lucide Icons](https://lucide.dev/icons/)
- [Hero UI](https://www.heroui.com/)
- [react-rnd](https://github.com/bokuweb/react-rnd)
