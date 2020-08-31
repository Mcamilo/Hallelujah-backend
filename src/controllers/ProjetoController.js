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
    async vote(req, res){
        const {id_projeto, voto, justificativa, id_conselheiro} = req.body
        const projeto = await Projetos.findById(id_projeto)
        projeto.votos.push({
            voto,id_conselheiro,justificativa
        })
        const updated = await projeto.save()
        return res.status(200).json({message: "ok"})
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
