const jwt = require('jsonwebtoken');

// HTTP API (payload format 2.0) simple authorizer response.
module.exports.handler = async (event) => {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader) {
    return { isAuthorized: false };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      isAuthorized: true,
      context: {
        username: decoded.sub,
      },
    };
  } catch (err) {
    return { isAuthorized: false };
  }
};
