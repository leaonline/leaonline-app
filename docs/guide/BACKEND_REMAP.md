# Backend Remap

## Why remap?

The [map screen](../../arch/screens/03-map-screen-01-overview.png) is a projected view of available
unitSets and units for a given field. Selecting a "stage" on the map reveals a further selection
of dimensions in the [dimension select screen](../../arch/screens/03-map-screen-02-dimension-select.png).

It is a costly operation to build the data structure in a way, that fits the requirements on the given screens.
At the same time we sometimes have to deal with [updated collections data, due to syncing](./BACKEND_SYNC.md).

We therefore camae up with the solution to build the datastructure for the map on the server at startup and only
if the `remap` flag is set to `true` (and `dryRun` is set to `false`).

The result is saved in a collection, where it's then easily available for all clients to be fetched from the 
backend and to be iterated and rendered without further computations.

## How it works

TBD

## Data structures

TBD



