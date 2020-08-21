const csv = require('csv-parser')
const fs = require('fs')

async function read_csv(tipo){
  let promise = new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('Covid_data/Tabela_metricas_covid.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log("Done Reading");
        const filtered_data = filter_csv(tipo, results)
        resolve(filtered_data)
      });
  })
  return promise
}

function filter_csv(par, dataset){
  const filtered_data = dataset.reduce((c,v)=>{
    if (v.tipo == par) {
      c['datas'] = c['datas'] || []
      c['datas'].push(v.data)
      c['valor'] = c['valor'] || []
      c['valor'].push(v.valor)
      c['abaixo_95'] = c['abaixo_95'] || []
      c['abaixo_95'].push(v.abaixo_95)
      c['acima_95'] = c['acima_95'] || []
      c['acima_95'].push(v.acima_95)
    }
    return c;
  }, {})
  console.log("Done Filtering");
  return filtered_data
}

module.exports = {
    async read(req, res){
      const {tipo} = req.params
      const response = await read_csv(tipo)
      console.log("Done");
      res.json(response)
    }
};
