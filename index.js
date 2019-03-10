const express = require('express');
const jwt = require('jsonwebtoken');

const PORT = 5000;
const app = express();

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello /api!'
  })
});

// protected route. Can't let unauthenticated user access /api/posts
// curl -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InVzZXJtYW4iLCJlbWFpbCI6InVzZXJtYW5AZ21haS5jb20ifSwiaWF0IjoxNTUyMTg4MjMwfQ.oj-wCwKikneMelkU5fxnvMB27g4i9GnCMKaJNN5j2D4" http://localhost:5000/api/posts
app.post('/api/posts', verifyToken /*middleware*/, (req, res) => {
  // in verifyToken, req.token is injected. Here it is being verified
  // how is this being verified?
  // We send the token in headers['authorization'] when making POST to /posts
  // That token string is now inside req.token
  // when jwt.verify(token, secretKey) happens, is it JUST verifying it against secretKey?
  // IF verify is success (no error) - it will PARSE that hashed JSON into data (authData)
  // And that authData is really the user data that we started earlier...
  // so THAT'S how JSONWebToken works.
  // First, it creates a token using secretkey
  // Then we pass that token, compare it with our secret key. If the secret key unlocks it, it will return a JSON object from middle JWT thingy
  // we can then use that middle part of jwt
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err){
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created',
        authData
      });
    }
  });
});

app.post('/api/login', (req, res) => {
  // login with this user info
  const user = {
    id: 1,
    username: 'userman',
    email: 'userman@gmai.com'
  }
  const secretKey = 'secretkey';
  jwt.sign({user: user}, secretKey, {expiresIn: '60s'}, (err, token) => {
    res.json({
      token
    })
  });
});

function verifyToken(req, res, next){
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' '); 
    const bearerToken = bearer[1];

    // injects req.token in this middleware
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  };
};
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
