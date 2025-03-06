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
- SWR to handle client-side fetching

## Developers

### Installation

- Run `npm install`
- Set `DATABASE_URL` in .env
- Run `npx auth secret` to generate an auth secret in .env
- Additional setup for the auth providers

### Features to implement

- [x] Zod for validation (should be configurable with drizzle)
- [x] Configurable dictionary
- [ ] More Auth options
- [x] Roled-based access (admin, master, user)
- [x] Movable windows (react-rnd)
- [x] Error management when calling all server actions (implement toast)
- [x] Catch 404 page without layout
- [x] Build more robust logic for "hasCharacter", maybe linking the property with the character table instead of a boolean
- [x] Add zod validation for new character from (trim, first letter uppercase, rest lowercase, no spaces - base for the rest of the validation)
- [x] Create logic for character selection (redirect logic already present) and second character creation in the settings
- [x] Add weather logic depending on calendar
- [x] Make database table for weather
- [x] Set up cron jobs once a day for weather (and future cron jobs )
- [ ] Properly manage arriving to a location that is hidden (redirect to game)
- [ ] Game documentation (Wiki-like system, admins can add or modify pages)
- [ ] Character sheets (find a system to parse custom HTML/CSS)
- [x] Weather icons / labels
- [ ] Game system (stats, abilities, powers) and logics
- [ ] Private chats (on and off game)
- [ ] Forum (with private threads and search functionality)
- [ ] Internal market
- [ ] Admin and master controls (especially for managing characters, banning, managing locations, forum, docs, reading chat and location histories)
- [ ] News section on login (but before entering the game) that the admin can set up and update
- [ ] Characters registry, searchable and/or divided in pages. Implement "last seen"
- [ ] Pins for locations
- [ ] Implement user settings in the client store, updated on login
- [ ] Add the ability for masters to post a picture in chat
- [ ] Ticket management system for masters
- [ ] Cookie consent and GDPR compliance

### TODO

- [ ] Update labels in messages/it.json (evergoing)
- [x] Put translation labels of weather
- [x] Investigate on a way to save location chats (generating html or similar, with a specific call)
- [x] Make labels for error messages to call in server functions
- [x] Implement string sanitization in the chat (Interweave)
- [ ] Make locations in the online characters menu clickable (links to location)
- [ ] Implement "just entered" on online characters component
- [ ] Add all cron jobs
- [x] Evaluate to migrate all get requests to API routes
- [x] Investigate a way to cache information you don't want to fetch too often (like weather)
- [x] Movables should be able to reduce to icon or at least temporarely hide with a button

### Bugs

- [x] White flashing on route navigation
- [x] Only render the navbar when starts with "/game" but it's also valid
- [x] Movable will increase height and width limits when pushed on the edges
- [x] Fix positioning of the avatar
- [x] When in a location and mobile mode, the movable will not take full screen

### Cron jobs to implement
- [x] Weather (to run daily)
- [ ] Delete chat messages (older than x months)
- [ ] Delete sessions older than a week
- [ ] Delete messages older than x
- [ ] Delete private locations not accessed for longer than 7 days 

### Utils and Docs

- [Lucide Icons](https://lucide.dev/icons/)
- [Hero UI](https://www.heroui.com/)
- [react-rnd](https://github.com/bokuweb/react-rnd)
- [Interweave](https://interweave.dev/docs/)

### Documentation

- Auth
- Database
- Structure: pages, components
- Fetching: server functions, server actions, API routes
- Contexts: Game context, Chat context
- Portals

#### Cron jobs
In the vercel.json file, cron jobs can be defined on the select API routes.<br />
Eg., for weather, it will be executed everyday at 5 ( "schedule": "0 5 \* \* \*") using the key CRON_SECRET in the env variables.

#### Fetching data
Fetch is primarily made on server, when possible (directory @/server).<br />
When it's needed to fetch client side, use an API route. The API route can call the functions inside the @/server directory (not the actions!).<br />
Server actions (@server/actions) are only used for mutations (POST), both server and client side.<br />
Error messages are set with NextIntl on the server (server action or server function).
Client-side, it will be catched (try/catch)if it's a server action (mutation) or catched in the API route and handled with SWR error if it's a GET request.<br />
If the data validation (Zod - parse) is made server side and we check there are no errors, we can be sure of the type, else we'd have an error.<br />
Important: not every error should be displayed to the user, because of how the application works. For example, "invalid character" should never happen, so there's no need to show the user a toast message for that. SWR retries on error if there's a network problem.

#### Messaging
User can create a new conversation by adding one or more characters. If adding more than one character, it's considered
to be a group conversation, and they'll be able to add a name for the group. The rules change slighly between the two types
of conversations. <br />
User is able to soft delete a conversation. The other user will still be able to see the conversation, and if a message
it's sent to the user who delete the conversation, that same conversation will reappear in the list with the previous messages.
If both users delete the conversation, it will still be accessible if they decide to text each other again.
If it's a group conversation, deleting it will effectively quit the group, with a message send to the other members.
Only the creator of the group can re-add a person who previously left.
