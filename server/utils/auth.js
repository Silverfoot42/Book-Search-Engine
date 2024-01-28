const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ context }, next) {
    const { req } = context;

    // allows token to be sent via  request headers
    let token = req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (token) {
      token = token = token.replace('Bearer ', '');

      // verify token and get user data out of it
      try {
        const { data } = jwt.verify(token, secret, { maxAge: expiration });
        context.user = data;
      } catch {
        throw new Error('Invalid token');
      }
    } else {
      throw new Error('You have no token!');
    }

    // send to next endpoint
    return next();
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
