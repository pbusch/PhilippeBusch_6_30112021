const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const passwordValidator = require('password-validator');

exports.signup = (req, res, next) => {

    let emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(String(req.body.email).toLowerCase());
    let schema = new passwordValidator();
    schema.is().min(1);

    if (emailformat && schema.validate(req.body.password)) {

        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'User created' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ error: 'invalid email or empty password' });
    }
};


exports.login = (req, res, next) => {

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: { message: 'Incorrect password' } });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.APP_SECRET,
                            //'R_TOeyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYzNzc3MTY2MSwiaWF0IjoxNjM3NzcxNjYxfQ.MmonW5mqGHGnPmgCyVRoA8hXzqERw-q6by3a_tT',
                            { expiresIn: '24000h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};