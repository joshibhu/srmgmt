const jwt = require("jsonwebtoken");
const config = require('../config/config');
const User = require("../models/user");
const Role = require("../models/role");

verifyToken = ((req, res, next) => {
    //const authHeader = req.headers.authorization;
    const token = req.cookies['jwt'];
    if (!token) {
        res.status(403).send({
            status: 403,
            message: 'Token is missing'
        });
        return;
    }
    // let token = authHeader.split(' ')[1];
    //let token = req.headers["x-access-token"];

    if (!token) {
        res.status(403).send({ message: "No token provided!" });
        return;
    }

    return jwt.verify(token, config.authKey, async (err, decoded) => {
        if (err) {
            res.status(401).send({ message: "Unauthorized Access!" });
            return;
        }
        req.userId = decoded.id;
        await setUserNameandRole(req);
        next();
    });
});

async function setUserNameandRole(req) {
    let user = await User.findById(req.userId).select('-password').populate('roles').populate('designation');
    if (user !== 'null') {
        req.user = user;
        req.roles = user.roles.map((obj) => obj.name);
    } else {
        console.error('no user found against the given token !!')
        res.status(500).send({ message: "Unauthorized Access!" });
        return;
    }
}

isAdmin = ((req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Admin Role!" });
                return;
            }
        );
    });
});

isFxUser = ((req, res, next) => {
    //check if user exist in database or not
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "fx" || roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Fx Role!" });
                return;
            }
        );
    });
});

isUser = ((req, res, next) => {
    //check if user exist in database or not
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "user" || roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require User Role!" });
                return;
            }
        );
    });
});

const auth = {
    isUser,
    isAdmin,
    isFxUser,
    verifyToken
};

module.exports = auth;
