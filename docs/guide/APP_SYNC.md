# App Sync

The app requires certain data that is rarely subject to change.
This includes the following contexts:

- Dimension
- Level
- Legal
- Field
- Feedback docs
- Map-Data
- Map-Icons

## Sync with AsyncStorage

The overall amount of data to be synced is neglect-able
and should be synced with async storage.

## Workflow

During app startup there will be a request to the server
(assuming a connection), that asks for a sync document.

The document contains the names of the contexts with a timestamp,
and a hash, representing the last update of the server collection
and the hash for data integrity. Example:

```js
{
  dimension: {
    timestamp: ISODate('2023-01-01'),
    hash: 'a9798fc6d14b'
  },
  // ...other contexts
}
```

At the same time the app will load the local sync document
from AsyncStorage and compare the values.

If a value does not match the hash from the server,
it will start a request for all documents and replaces the 
locally stored ones with the new incoming docs.

After that the sync doc will be updated to represent the new
state.

The app can now continue to run.

## Sync Screen

If a sync is required the app should forward to
a reserved sync-screen that informs the user about the
sync procedure and the status.

Once complete, the user will be redirected to
the home screen.
