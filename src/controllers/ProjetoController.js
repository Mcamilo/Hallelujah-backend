const Projetos = require('../models/Projeto');
require('dotenv').config()

module.exports = {
    async store(req, res, next){
        const {
        id_org,
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
        imagem_url,
        } = req.body

        try {
            const projeto = await Projetos.create({
                id_org,
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
                imagem_url,
            })
            req.projeto_id = projeto._id
            return next()

        } catch (error) {
            return res.status(400).json({message: error.message})
        }
    },
    async find(req, res){
        const {id_org} = req.params;
        Projetos.find({id_org}, (err, result)=>{
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
    }

};
