const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.method !== "OPTIONS") {
        try {
            const token = req.headers.authorization.split(' ')[1];
            //const decodedToken = jwt.verify(token, 'R_TOeyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYzNzc3MTY2MSwiaWF0IjoxNjM3NzcxNjYxfQ.MmonW5mqGHGnPmgCyVRoA8hXzqERw-q6by3a_tT');
            //const userId = decodedToken.userId;
            //req.token = jwt.verify(token, 'R_TOeyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYzNzc3MTY2MSwiaWF0IjoxNjM3NzcxNjYxfQ.MmonW5mqGHGnPmgCyVRoA8hXzqERw-q6by3a_tT');
            req.token = jwt.verify(token, process.env.APP_SECRET);
            if (req.body.userId && req.body.userId !== req.token.userId) {
                throw 'Invalid user ID';
            } else {
                next();
            }
        } catch {
            res.status(401).json({
                error: new Error('Invalid request!')
            });
        }
    } else {
        next();
    }
};