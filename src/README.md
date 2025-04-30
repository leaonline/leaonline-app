# lea.online app backend

This is the server code, handling all relevant data and logic for operating
the app.

## Architecture overview

- The client registers to an account, including restore codes and an optional 
email address, reflected by the `Users` model.

- The `Map` is a read-optimized version of the playable content.

- The `Session` tracks the current state of the user's app usage.

- The `Progress` tracks the user's progress of the stages and milestones on the 
map.

- The `Response` stores all responses and scores of a given item.

- The `Sync` stores a hash, distributed to clients to indicate that content has
been out of sync and should resync.