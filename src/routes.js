require('dotenv').config()
const express = require('express');

const routes = express.Router();

const AuthMiddleware = require('./middlewares/Authmiddleware')
const PerfilController = require('./controllers/PerfilController')
const ProjetoController = require('./controllers/ProjetoController')

routes.get('/', AuthMiddleware.checkToken, (req,res)=>{
    return res.status(200).json({success:true,message:`Server in On`})
});
// Acesso 
routes.post('/', PerfilController.createToken)
routes.post('/registrar', PerfilController.store)
// To-do 
    // Editar Info pefil
    // Esqueci Senha

// Projetos
routes.post('/projetos', ProjetoController.store, (req,res)=>{
    return res.status(200).json({success:true, message:"Projeto Cadastrado"})
})
routes.get('/projetos', ProjetoController.findAll)
routes.get('/projetos/:id_org', ProjetoController.find)
routes.post('/votos', ProjetoController.vote)

// To-do 
    // Votacao
    // Trocar Status (Super Admin)


module.exports = routes;
