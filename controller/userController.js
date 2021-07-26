const { validationResult, cookie } = require('express-validator');
const bcryptjs = require('bcryptjs');

const user = require('../model/users');
const { destroy } = require('./productController');
const cookieParser = require('cookie-parser');

const userController = {
    register: (req, res) => {
        res.render('registro');
    },
    registerPro: (req, res) => {
        const error = validationResult(req)
        if (error.errors.length > 0) {
            res.render('registro', {
                errors: error.mapped(),
                datoIngresado: req.body
            });
        }
        let usuarioEnElJson = user.fineByField('email', req.body.email);
        if (usuarioEnElJson) {
            return res.render('registro', {
                errors: {
                    email: {
                        msg: 'Este Email ya esta registrado, ingrese otro Email'
                    }
                },
                datoIngresado: req.body
            });

        }
        let imagenAvatar = (req.file == undefined) ? "index.png" : req.file.originalname

        let userACrear = {
            ...req.body,
            clave: bcryptjs.hashSync(req.body.clave, 10),
            imageUsuario: imagenAvatar
        }
        user.create(userACrear);
        res.redirect('/users/inicio-sesion')
    },
    login: (req, res) => {
        res.render('inicio-sesion')
    },
    loginPro: (req, res) => {
        let userLogiado = user.fineByField('email', req.body.email);
        if (userLogiado) {
            let clave = bcryptjs.compareSync(req.body.clave, userLogiado.clave);
            if (clave) {
                delete userLogiado.clave;
                req.session.userLogged = userLogiado;

                if (req.body.recordame) {
                    console.log('pase por la cookie')
                    console.log(req.body.email);
                    res.cookie('userEmail', req.body.email, { maxAge: 1000 * 60 })
                }
                res.redirect('/users/profile')
            } else {
                return res.render('inicio-sesion', {
                    errors: {
                        email: {
                            msg: 'Las credenciales son incorrectas'
                        }
                    }

                });
            }
        }else{
        return res.render('inicio-sesion', {
            errors: {
                email: {
                    msg: 'No se encontro email en nuestra base de datos'
                }
            }
        });
    }
    },
    profile: (req, res) => {
        console.log(req.cookies)
        return res.render('profile', {
            user: req.session.userLogged
        });
    },
    logout: (req, res) => {
        req.session.destroy();
        res.clearCookie('userEmail')
        res.redirect('/users/inicio-sesion')
    }
}

module.exports = userController