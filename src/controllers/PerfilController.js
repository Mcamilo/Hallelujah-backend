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

        await Perfil.paginate({ papel: { $ne: "admin" } }, options, (err, result)=>{
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
    async recover(req, res, next){    
        Perfil.findOne({email: req.body.email})
        .then(user => {
            if (!user) return res.status(401).json({message: 'O endereço de email: ' + req.body.email + ' não está associado com nenhuma conta.'});

            //Generate and set password reset token
            user.generatePasswordReset();
            // Save the updated user object
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
                    return res.status(200).json({link})
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: process.env.REMETENTE_EMAIL,
                          pass: process.env.REMETENTE_SENHA
                        }
                      });

                    const mailOptions = {
                        to: user.email,
                        from: process.env.REMETENTE_EMAIL,
                        subject: "Password change request",
                        text: `Olá ${user.nome} \n 
                    Por favor clique no link a seguir ${link} para resetar a sua senha. \n\n 
                    Se você não requisitou a recuperação, ignore esse email.\n`,
                    };
                    
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          res.status(500).json({error})
                        }
                        res.status(200).json({message: 'Email de alteração de senha foi enviado para: ' + user.email + '.'});
                    });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));        
    },
    async reset(req, res){
        Perfil.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Token invalido ou expirado.'});            
            res.status(200).json({user});
        })
        .catch(err => res.status(500).json({message: err.message}));
    },
    async resetPassword (req, res){
        Perfil.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
            .then((user) => {
                if (!user) return res.status(401).json({message: 'Token invalido ou expirado.'});    
                //Set the new password
                user.senha = req.body.senha;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
    
                // Save
                user.save((err) => {
                    if (err) return res.status(500).json({message: err.message});
                    
                    // var transporter = nodemailer.createTransport({
                    //     service: 'gmail',
                    //     auth: {
                    //       user: process.env.REMETENTE_EMAIL,
                    //       pass: process.env.REMETENTE_SENHA
                    //     }
                    //   });
                    
                    // const mailOptions = {
                    //     to: user.email,
                    //     from: process.env.FROM_EMAIL,
                    //     subject: "Sua senha foi alterada",
                    //     text: `Olá ${user.username} \n 
                    //     A senha do email: ${user.email} foi alterada com sucesso!.\n`
                    // };                        
    
                    // transporter.sendMail(mailOptions, function(error, info){
                    //     if (error) {
                    //       res.status(500).json({error})
                    //     }
                    //     res.status(200).json({message: 'Email de confirmação foi enviado para: ' + user.email + '.'});
                    // });
                    res.status(200).json({message: 'Sucesso'})
                });
            });
    }
};
