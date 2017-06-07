'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const request    = require('request');
const _          = require('lodash');
const app        = express();

var users = {};
var seq   = +new Date;

app.use(bodyParser.json());

app.post('/users', function(req, res) {
  const id          = seq++;
  const accessToken = `FAKEBOOK${id}`;

  const user = Object.assign({}, req.body, {id: String(id)})
  if( !user.name ) { user.name = 'Sancho Panza' }
  user.first_name = user.name.split(' ')[0]
  user.last_name = user.name.split(' ').slice(1).join(' ')

  users[accessToken] = user;
  res.json({
    access_token: accessToken,
    id: id,
  })
})

app.use(function(req, res, next) {
  if( !req.query.access_token || !req.query.access_token.match(/^FAKEBOOK/) ) {
    console.warn("Proxying request to facebook");
    const url = `https://graph.facebook.com${req.url}`;
    return req.pipe(request(url)).pipe(res);
  }

  next();
})

app.post('/friends/:id', function(req, res) {
  const user = users[req.query.access_token];
  user.friends = user.friends || [];
  user.friends.push({id: req.params.id})

  for( var i in users ) {
    if( users[i].id == req.params.id ) {
      users[i].friends = users[i].friends || [];
      users[i].friends.push({id: user.id})
      break;
    }
  }

  res.sendStatus(204);
})

app.get('/me', function(req, res) {
  const user = users[req.query.access_token];

  if( !user ) {
    return res.status(400).json({
      error: {
        message: "Invalid OAuth access token.",
        type: "OAuthException",
        code: 190,
        fbtrace_id: "fakebook"
      }
    });
  }

  user.permissions = {data: []}
  user.picture = { data: { url: 'https://placehold.it/256x256' }}

  const fields = ['id', 'name'].concat(
    (req.query.fields || '').split(',')
  ).concat(
    (req.query.fields || '').match(/picture/) ? 'picture' : null
  )

  res.json(_.pick(user, fields));
})

app.get('/me/friends', function(req, res) {
  const user = users[req.query.access_token];

  res.json({
    data: user.friends || []
  })
})

if( module.parent ) {
  module.exports = function(port) {
    const server = app.listen(port);
    let handle   = server.close.bind(server);
    return handle;
  }
} else {
  const port = process.env.PORT || 4200
  app.listen(port, function() {
    console.log(`fakebook listening on ${port}...`);
  });
}
