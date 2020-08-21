const csv = require('csv-parser')
const fs = require('fs')

async function read_csv(campo){
  let promise = new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('Covid_data/Tabela_dados_covid.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log("Done Reading");
        const filtered_data = filter_csv(campo, results)
        resolve(filtered_data)
      });
  })
  return promise
}

function filter_csv(par, dataset){
  const filtered_data = dataset.reduce((c,v)=>{
    c['datas'] = c['datas'] || []
    c['datas'].push(v.data)
    c[par] = c[par] || []
    c[par].push(v[par])
    return c;
  }, {})
  console.log("Done Filtering");
  return filtered_data
}

module.exports = {
    async read(req, res){
      const {campo} = req.params
      const response = await read_csv(campo)
      console.log("Done");
      res.json(response)
    }
};
