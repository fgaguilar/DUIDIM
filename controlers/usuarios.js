const { response, request } = require('express')
const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')

const Usuario = require('../models/usuario')

const usuarioGet = (req = request, res=response) => {

    const { q, nombre = 'no name', apikey, page = '1', limit} = req.query

    res.json({
      msg: "get API - controlador",
      q,
      nombre,
      apikey,
      page,
      limit
    })
};
const usuarioPost = async(req, res=response) => {

    const errors = validationResult(req)
    if (errors) {
      return res.status(400).json(errors)
    }


    const { nombre, correo, password, rol } = req.body
    const usuario = new Usuario( { nombre, correo, password, rol } )

    // Verificar correo
    const existeEmail = await Usuario.findOne({ correo })
    if (existeEmail) {
      return res.status(400).json({
        msg: 'El correo ya esta registrado'
      })
    }
    // Encriptar contraseña
    const salt = bcryptjs.genSaltSync()
    usuario.password = bcryptjs.hashSync( password, salt )


    await usuario.save()

    res.json({
      usuario
    })
};
const usuarioPut = (req, res=response) => {

    const { id } = req.params

    res.json({
      msg: "put API - controlador",
      id
    })
};
const usuarioPatch = (req, res=response) => {
    res.json({
      msg: "patch API - controlador",
    })
};
const usuarioDelete = (req, res=response) => {
    res.json({
      msg: "delete API - controlador",
    })
};

module.exports = {
    usuarioGet,
    usuarioPost,
    usuarioPut,
    usuarioPatch,
    usuarioDelete
}