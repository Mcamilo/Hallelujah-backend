const Projetos = require('../models/Projeto');
const Perfil = require('../models/Perfil');
require('dotenv').config()
const crypto = require('crypto')

async function getPerfilById(profile_id){
    return await Perfil.findById(profile_id).exec()
}

module.exports = {
    async store(req, res, next){
        const {profile_id} = req.decoded;
        const {nome} = await getPerfilById(profile_id);
        
        const {
        titulo,
        responsavel,
        d_inicio,
        d_final,
        caracteristicas,
        objetivos_gerais,
        objetivos_especificos,
        publico_alvo,
        descricao_evangelistica,
        instituicao_parceiro,
        responsavel_parceiro,
        descricao_parceria,
        projetos_andamento,
        contatos,
        voluntarios,
        resultados_esperados,
        recursos_necessarios,
        pessoal,
        locacao,
        equipamentos,
        materiais,
        outros_custos
        } = req.body
        
        const fileName = `${crypto.randomBytes(16).toString("hex")}-${req.file.originalname}`
        try {
            const projeto = await Projetos.create({
                id_org: profile_id,
                nome_org:nome,
                titulo,
                responsavel,
                d_inicio,
                d_final,
                caracteristicas,
                objetivos_gerais,
                objetivos_especificos,
                publico_alvo,
                descricao_evangelistica,
                instituicao_parceiro,
                responsavel_parceiro,
                descricao_parceria,
                projetos_andamento,
                contatos,
                voluntarios,
                resultados_esperados,
                recursos_necessarios,
                pessoal,
                locacao,
                equipamentos,
                materiais,
                outros_custos,
                imagem_url: fileName,
            })
            req.projeto_id = projeto._id
            req.fileName = fileName
            return next()

        } catch (error) {
            return res.status(400).json({message: error.message})
        }
    },
    async find(req, res){
        const {profile_id} = req.decoded;
        Projetos.find({id_org:profile_id}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findProjeto(req, res){
        const {id_projeto} = req.params
        const projeto = await Projetos.findById(id_projeto)
        return res.status(200).json(projeto)
    },
    async findAll(req, res){
        const { page } = req.body
        const options = {
            page,
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Projetos.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findAvaliar(req, res){
        const options = {
            page:1,
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Projetos.paginate({ status: { $in:["Deliberação","Votação"] } }, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: err});                
            }else{
                return res.json(result)
            }
        })
    },
    async votar(req, res){
        const {id_projeto, justificativa, voto} = req.body
        const {profile_id} = req.decoded;
        const {nome} = await getPerfilById(profile_id);
        
        const projeto = await Projetos.findOne({_id:id_projeto, "votos.id_conselheiro":profile_id})
        if (projeto){
            console.log("VOTO")
            projeto.votos.map(elem=>{
                if (elem.id_conselheiro == profile_id){
                    elem.voto = voto
                    console.log(voto)
                }
            })
            
            const updated = await projeto.save()
            return res.status(200).json({message: "Voto"})
        }else{
            console.log("DEL")
            const projetoUp = await Projetos.findById(id_projeto)
            projetoUp.votos.push({
                id_conselheiro:profile_id,justificativa, nome_conselheiro:nome
            })
            const updated = await projetoUp.save()
            return res.status(200).json({message: "Deliberação"})
        }
    },
    async checkVote(req, res){
        const {profile_id} = req.decoded;
        const {id_projeto} = req.body;

        const projeto = await Projetos.findOne({_id:id_projeto})
        try{
            votos = projeto.votos.filter(voto=>voto.id_conselheiro==profile_id)
            return res.status(200).json({votos})
        }catch(err){
            return res.status(400).json({err})
        }
    },
    async updateStatus(req, res){
        const {id_projeto, status} = req.body;
        const projeto = await Projetos.findByIdAndUpdate(id_projeto,{
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
