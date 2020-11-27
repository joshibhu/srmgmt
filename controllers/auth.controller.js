var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const config = require('../config/config.js')

exports.login = async (req, res) => {
    res.status(200).render('login');
};

exports.signin = async (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                res.status(500).render('login', { error: err });
                return;
            }

            if (!user) {
                return res.status(404).render('login', { error: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            // var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            //     expiresIn: process.env.JWT_EXPIRY_TIME // 24 hours
            // });

            var token = jwt.sign({ id: user.id }, config.authKey);

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }
            res.cookie('jwt', token);
            res.status(200).send({ success: true });
        });
};

exports.signup = async (req, res) => {
    if (req.body.password !== req.body.confirm_password) {
        res.status(500).render('user_register', { error: 'password mismatch !!' });
        return
    }
    const user = new User({
        name: req.body.first_name + ' ' + req.body.last_name,
        email: req.body.email,
        password: req.body.password
    });

    user.save((err) => {
        if (err) {
            res.status(403).render('user_register', { error: err.message });
            return;
        }
        res.render('user_register', { success: "Registered successfully! Please wait for admin confirmation before log in !!" });
    });
};

exports.signout = async (req, res) => {
    res.clearCookie('jwt').render('login');
};

