# tinybook

A tiny express server to swap in for your facebook graph requests.

## Usage

In your test, start an instance of the fakebook server and get "valid" facebook access tokens for login. Example using request-promise for http requests

```js
// in test
const fakebook = require('fakebook')
const close = fakebook(4200)

request({
  url: 'http://localhost:4200/users',
  method: 'POST',
}).then((body) => {
  console.log(body.access_token)
  // use this access token to "log in with facebook"
})

close()
```

In your app, use fakebook as the base url instead of https://graph.facebook.com in all environments except production. Example using request-promise for http requests:

```js
// in code
const baseUrl = process.env.NODE_ENV === 'production' ? 'https://graph.facebook.com' : 'http://localhost:4200';

request(baseUrl + '/me?access_token=' + req.body.access_token).then(() => {
  // do something with your facebook user
})
```

## Administrative Endpoints

#### POST /users

Creates a fakebook user with an access token and passes along any parameters you give it.

`curl -XPOST http://localhost:4200/users -d '{"name": "Neil Sarkar"}'`

#### POST /friends/:id?access_token=<FB ACCESS TOKEN>

Creates a fakebook friendship between the authenticated user and the provided ID.

## Facebook Endpoints Proxied

#### GET /me
#### GET /me/friends
