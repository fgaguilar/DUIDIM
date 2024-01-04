const { Router } = require("express");
const { check } = require('express-validator')

const { usuarioGet, usuarioPost, usuarioPut, usuarioDelete, usuarioPatch } = require("../controlers/usuarios");
const router = Router();

router.get('/', usuarioGet);

router.put("/:id", usuarioPut);

router.post("/",[
    check('correo','El correo no es valido').isEmail()
],usuarioPost);

router.delete("/", usuarioDelete);

router.patch("/", usuarioPatch);

module.exports = router;
