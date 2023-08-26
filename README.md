# Discord Bot to manage your servers

A discord bot built using `discord.js` which helps to manage your servers.
Right now it allows you some simple commands which Discord doesn't support natively.

- `/clear` command to clear the current channel
  - leave the subcommand blank to clear all the channels
  - or select a channel from the list of channels to clear it specifically
  - the clear command works synchronously, which means that if a clear process is already running for a channel then it won't initiate another.
- `/remcmd` to remove all the slash commands.
- Message any expression starting with `?` to execute it.
- A dedicated channel for all the server logs
- Sends random Good Morning GIFs every day at a particular to all the channels.

## Future plans

- [ ] Improvements in the scheduled GIFs.
  - [ ] Should be able to decide which channels will get the GIFs.
  - [ ] Should be able to change the timings for the GIFs schedules dynamically
  - [ ] Should be able to change the type of GIFs
