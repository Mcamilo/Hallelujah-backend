require('dotenv').config()
const express = require('express');
const Multer = require('multer');
const routes = express.Router();
const {Storage} = require("@google-cloud/storage")
const path = require('path')

const AuthMiddleware = require('./middlewares/Authmiddleware');
const PerfilController = require('./controllers/PerfilController');
const ProjetoController = require('./controllers/ProjetoController');

const gc = new Storage({
    keyFilename: path.join(__dirname, "../"+process.env.GCP_KEY_FILE),
    projectId: 'tough-healer-245802',
})

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 4 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
    fileFilter: (req, file, cb) => {
        const allowerdMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
            'image/jpg'
        ]
        if (allowerdMimes.includes(file.mimetype)){
            cb(null, true)
        } else {
            cb(new Error("Tipo de arquivo invalido."))
        }
    }
  });

const gcBucket = gc.bucket('instituto-hallelujah-bucket')

routes.get('/', AuthMiddleware.checkToken, (req,res)=>{
    return res.status(200).json({success:true,message:`Server in On`})
});

// Notificações
// Autorização 
routes.post('/', PerfilController.createToken)
routes.post('/registrar', PerfilController.store)
// To-do 
    // Editar Info pefil
    // Esqueci Senha


// Projetos
routes.post('/projetos', AuthMiddleware.checkToken, multer.single('file'), ProjetoController.store, (req,res,next)=>{
    console.log("CADASTRANDO PROJETO")
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    const blob = gcBucket.file(req.fileName);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
        console.log("ERRO!"+err)
    });

    blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${gcBucket.name}/${blob.name}`;
       console.log(`===============>> ${publicUrl}`);
    });
    blobStream.end(req.file.buffer);
    res.status(200).json({success:true, message:"ok"})
})

routes.post('/updateInfo/', AuthMiddleware.checkToken, PerfilController.updateInfo)

routes.get('/projetosUser/', AuthMiddleware.checkToken, ProjetoController.find)
routes.get('/projetos', ProjetoController.findAll)
// routes.get('/projetos/:id_org', ProjetoController.find)
routes.post('/votos', ProjetoController.vote)

// To-do 
    // Trocar Status (Super Admin)


module.exports = routes;
