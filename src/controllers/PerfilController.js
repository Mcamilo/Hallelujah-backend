require('dotenv').config()
const Perfil = require('../models/Perfil')
const jwt = require('jsonwebtoken')

module.exports = {
    async store(req, res){
        const { email, senha, nome, endereco, cidade, pais, cep, descricao } = req.body
        const usuarioExists = await Perfil.findOne({
                $and:[{email}]
            })
        if(usuarioExists){
            console.log(usuarioExists);
            return res.status(500).json({message: "Email não disponível"})
        }else{
            try {
                await Perfil.create({
                    email,
                    senha,
                    papel: 'user',
                    nome,
                    endereco,
                    cidade,
                    pais,
                    cep,
                    descricao
                })
                return res.status(200).json({message: "ok"})
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
        }
    },
    async storeConselheiro(req, res){
        const { email, senha, nome } = req.body
        const usuarioExists = await Perfil.findOne({
                $and:[{email}]
            })
        if(usuarioExists){
            console.log(usuarioExists);
            return res.status(500).json({message: "Email não disponível"})
        }else{
            try {
                await Perfil.create({
                    email,
                    senha,
                    papel: 'conselheiro',
                    nome,
                })
                return res.status(200).json({message: "ok"})
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
        }
    },
    async find(req, res){
        const {profile_id} = req.decoded;
        Perfil.find({_id:profile_id}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});
            }else{
                // To do refactorar para findById
                const resultado = result[0]
                return res.json({
                                id:resultado._id,
                                nome: resultado.nome, 
                                endereco: resultado.endereco,
                                cidade: resultado.cidade,
                                pais: resultado.pais,
                                cep: resultado.cep,
                                descricao: resultado.descricao,
                                status: resultado.status
                            })
            }
        })
    },
    async createToken(req, res){
        const {email, senha} = req.body
        Perfil.authenticate(email, senha, function (error, perfil) {
        if (error || !perfil) {
          return res.status(400).json({message: 'Email ou senha errada', error})
        } else {
          const profile_id = perfil._id
          const secret = process.env.JWT_SECRET
          const token = jwt.sign({profile_id},secret,{
              expiresIn: 259200
          })
          return res.send({token, email: perfil.email})
        }
        });
    },
    async getPapel(req, res){
        const {profile_id} = req.decoded;
        const {papel} = await Perfil.findById(profile_id)
        return res.status(200).json({papel})
    },

    async findAll(req, res){
        const page = 1
        const options = {
            page,
            sort: { papel:-1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Perfil.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
      
    },
    async updateInfo(req, res){
        const {profile_id} = req.decoded;
        const {nome, endereco, cidade, pais, cep, descricao} = req.body
        const perfil = await Perfil.findByIdAndUpdate(profile_id,{
        nome, endereco, cidade, pais, cep, descricao
        }, function(err, result) {
          if (err) {
            return res.status(400).json({err});
          } else {
           return res.status(200).json({message:"ok"});
          }
        })
    },
    async updateStatus(req, res){
        const {profile_id, status} = req.body;
        const perfil = await Perfil.findByIdAndUpdate(profile_id,{
        status
        }, function(err, result) {
          if (err) {
            return res.status(400).json({err});
          } else {
           return res.status(200).json({message:"ok"});
          }
        })
    },
};
