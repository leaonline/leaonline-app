# App Connection Testing

There are multiple conditions that affect connectivity:

- internet connection (wifi or mobile data)
- connected to the backend server
- app starts vs app has been already started
- app runs and is sent to background

However, the app should automatically detect the situation and correctly
attempt to establish a successful connection.

> A successful connection 

This creates a few scenarios to test:

## Test Scenarios

### A - App not yet started

| Intl. state | Action | web | backend | scneario |
|-------------|--------|---|------|----------|
| Not started | Start  | ✅ | ✅    | [A1]     |
| Not started | Start  | ✅ | ✖️     | [A2]     |
| Not started | Start  | ✖️  | ✅    | [A3]     |
| Not started | Start  | ✖️  | ✖️     | [A4]     |


#### [ A1 ] 
- Start backend server, then start app.
- App should connect and there should be no message about connection issues

#### [ A2 ]
- Start app, then wait until splash screen disappears
- a message should indicate there is internet but no backend connection
- start backend
- once started the app should connect and the message disappear

#### [ A3 ]
- disconnect phone from internet (disable wifi and mobile data)
- Start app, then wait until splash screen disappears
- a message should indicate there is no internet and no backend connection
- start backend
- once started the app should connect and the message disappear

#### [ A4 ]
- disconnect phone from internet (disable wifi and mobile data)
- Start app, then wait until splash screen disappears
- a message should indicate there is no internet and no backend connection
- start backend
- once started the app should connect and the message disappear