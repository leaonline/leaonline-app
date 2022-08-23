# Backend Sync

The following describes how the backend synchronizes with the content service.

## Why syncing?

The backend service always contains the latest updated data by the lea.online editors team.
This might, however, not be the state intended for production work.

Instead of configuring a complex process, that automatically decides to sync single documents,
we decided to do a **manual sync of full collections once and at startup**.

The sync is triggered manually by setting the `sync` flag of a given collection name to `true`.

## Sync strategy

This routine only runs at startup **once** after the backend is successfully connected to and authenticated at the
content service. It will ask the content service for all available documents of a flagged collection.

In the next step it will `upsert` these documents using the
[upsert method](https://docs.meteor.com/api/collections.html#Mongo-Collection-upsert):
if a document does not exist yet, it will be inserted, otherwise it will be updated.

## Shutting sync off

After you have successfully synced the collection(s) you should manually shut off sync by setting
the collection names in `setting.json` all to `false` to prevent unnecessary sync during startup.

This should also be done in production in order to reduce traffic and keep the integrity of the content.
