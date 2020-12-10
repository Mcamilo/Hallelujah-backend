const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var votoSchema = new Schema({
    voto:{
        type:String,
        enum:["Aprovado","Rejeitado","Revisar"]
    },
    id_conselheiro:Schema.Types.ObjectId,
    nome_conselheiro:String,
    justificativa:String
})
var cronogramaSchema = new Schema({
    // taskID:String,
    taskName:String,
    // tema:String,
    dataInicio:Date,
    dataFinal:Date,
})
const ProjetosSchema = new Schema({
    status:{
        type: String,
        required:true,
        default:"Desativado",
        enum:["Deliberação", "Votação", "Concluído", "Desativado"]
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
    votos:[votoSchema],
    cronogramas:[cronogramaSchema]
},{timestamps:true});
ProjetosSchema.plugin(mongoosePaginate)
module.exports = model('Projetos', ProjetosSchema);



// [
//     { type: 'string', label: 'Task ID' },
//     { type: 'string', label: 'Task Name' },
//     { type: 'string', label: 'Tema' },
//     { type: 'date', label: 'Start Date' },
//     { type: 'date', label: 'End Date' },
//     { type: 'number', label: 'Duração' },
//     { type: 'number', label: 'Percent Complete' },
//     { type: 'string', label: 'Dependencies' },
//   ]
// [
//     '2020Verão',
//     'Verão 2020',
//     'Verão',
//     new Date(2020, 5, 21),
//     new Date(2020, 8, 20),
//     null,
//     100,
//     null,
//   ]