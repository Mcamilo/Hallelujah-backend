const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var votoSchema = new Schema({
    voto:{
        type:String,
        enum:["Aprovado","Rejeitado","Revisar"]
    },
    id_conselheiro:Schema.Types.ObjectId,
    justificativa:String
})
const ProjetosSchema = new Schema({
    status:{
        type: String,
        required:true,
        default:"Deliberação",
        enum:["Deliberação", "Votação", "Concluído"]
    },
    id_org:{
        type:Schema.Types.ObjectId,
        required:true
    },
    nome_org:String,
    titulo:String,
    responsavel:String,
    d_inicio:String,
    d_final:String,
    caracteristicas:String,
    objetivos_gerais:String,
    objetivos_especificos:String,
    publico_alvo:String,
    descricao_evangelistica:String,
    instituicao_parceiro:String,
    responsavel_parceiro:String,
    descricao_parceria:String,
    projetos_andamento:String,
    contatos:String,
    voluntarios:String,
    resultados_esperados:String,
    recursos_necessarios:String,
    pessoal:String,
    locacao:String,
    equipamentos:String,
    materiais:String,
    outros_custos:String,
    imagem_url:String,
    votos:[votoSchema]
},{timestamps:true});
ProjetosSchema.plugin(mongoosePaginate)
module.exports = model('Projetos', ProjetosSchema);