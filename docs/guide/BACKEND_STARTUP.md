# Backend Startup

This guide resolves around all processes that are involved when the backend is starting up.

## Run the backend

The backend contains a script `run.sh` that starts it with the correct environment settings.


## The `settings.json` file

The backend uses `settings.json` as startup configuration.
They are set via [environment variable](https://docs.meteor.com/environment-variables.html#METEOR-SETTINGS) in `run.sh`.
There are a few concepts in this config which need further explanation:

### Remotes

This contains configuration regarding remote apps and services. 
A simple example is on which URL the service is accessed.

#### Content

The backend currently connects to one remote, the [content server](https://github.com/leaonline/leaonline-content).
The following configuration is therefore used in combination with the content server:

`url:string` - the url of the content server, used to connect to it

`jwt:{key:string, sub:string}` - JsonWebToken credentials for user-less authentication

`sync:object` - defines which of the backend collections are to be synced at startup.
Read more about it in [the backend sync guide](./BACKEND_SYNC.md).


### Restore

Users will receive restore codes during their registration.
These codes can be used to restore their account on another device.

This config defines a detailed behaviour on how these codes are generated.

### Crypto

Keys and settings for the encryption of certain data.

### Log

Settings for the logging behaviour.
