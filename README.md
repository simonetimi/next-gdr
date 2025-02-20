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

### Guidelines

- In vercel.json, cron jobs can be defined on the select API routes. Eg., for weather, it will be executed everyday at 5 ( "schedule": "0 5 \* \* \*") using the key CRON_SECRET in the env variables

### Features to implement

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
- [x] Add weather logic depending on calendar
- [x] Make database table for weather
- [x] Set up cron jobs once a day for weather (and future cron jobs )
- [ ] Properly manage arriving to a location that is hidden (redirect to game)
- [ ] Game documentation (Wiki-like system, admins can add or modify pages)
- [ ] Character sheets (find a system to parse custom HTML/CSS)
- [ ] Weather icons / labels
- [ ] Game system (stats, abilities, powers) and logics
- [ ] Private chats (on and off game)
- [ ] Forum
- [ ] Internal market
- [ ] Admin and master controls (especially for managing users, banning, locations, forum, docs)

### TODO

- [ ] Update labels in messages/it.json (evergoing)
- [ ] Add cron job to clear weather table every 30 days
- [ ] Put translation labels of weather
- [ ] Investigate on a way to save location chats (generating html or similar, with a specific call
- [ ] Make labels for error messages to call in server functions

### Bugs

- [x] White flashing on route navigation
- [x] Only render the navbar when starts with "/game" but it's also valid
- [ ] Movable will increase height and width limits when pushed on the edges
- [x] Fix positioning of the avatar
- [ ] When in a location and mobile mode, the movable will not take full screen

### Cron jobs to implement
- [x] Weather
- [ ] Delete chat logs (older than x
- [ ] Delete sessions older than a week
- [ ] Delete messages older than x

### Utils and Docs

- [Lucide Icons](https://lucide.dev/icons/)
- [Hero UI](https://www.heroui.com/)
- [react-rnd](https://github.com/bokuweb/react-rnd)
