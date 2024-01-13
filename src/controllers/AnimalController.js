
const connection  = require('../database/connection')


var sharp = require('sharp');
const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()
var ImageKit = require("imagekit");
const fsPromises = require('fs').promises;


var imagekit = new ImageKit({
  publicKey : "public_8IYkWTIrXKNBNHAc5HEOTMjc/ws=",
  privateKey : "private_KkVCTaVWQ2ZTYiB423cX9H7Gmss=",
  urlEndpoint : "https://ik.imagekit.io/adote/"
});

module.exports = {
  async index(request, response) {
    console.log('aaaaaaa')
    if(request.query.telefone){
      const doador = await connection('animal')
      .select('*')
      .where('DoadorTelefone', '=',request.query.telefone).then(() => {

      }).catch((error) => {
        console.log(error)
      })
      return response.json(doador)
      }else {
      const { page = 1 } = request.query


      const [count] = await connection('animal').count()
      
      const animal = await connection('animal')
        .join('doador', 'doador.telefone', '=', 'animal.DoadorTelefone')
        .limit(10)
        .offset((page - 1) * 10 )
        .select([
          'animal.*',
          'doador.nome',
          'doador.telefone',
        ])
      response.header('X-Total-Count', count['count(*)'])
      
      return response.json(animal)
      }
 },

  async create(request, response) {
    const { filename } = request.file 
    const { Nome, Descricao, DataNasc, Sexo, Tipo, Vacina, id_doador, Vermifugado} = request.body
    const  DoadorTelefone  = request.headers.authorization
    const foto = filename
    const foto_resize = 'resize_'+filename
    

    const insertFile = new Promise((resolve, reject) => {
      sharp('./uploads/'+foto).resize(441,544).jpeg({quality : 100}).toFile('./uploads/'+foto_resize)
        .then(async ()=>{
              await fsPromises.readFile('./uploads/'+foto_resize).then((fileBuffer) => {
                imagekit.upload({
                  file : fileBuffer, 
                  useUniqueFileName: false,
                  fileName : foto_resize,  
                }).then(async (a) => {
                  await connection('animal').insert({
                    Nome,
                    Descricao,
                    DataNasc,
                    Sexo,
                    DoadorTelefone,
                    foto,
                    Tipo,
                    Vacina,
                    id_doador,
                    Vermifugado
                  }).then(() => {
                    resolve(a)
                  }).catch((err) => {
                    console.log(err)
                    reject(err)
                  })
                })
                .catch((err) => {
                  console.log(err)
                  reject(err)
                })
              }).then(() => {
              }).catch((e)=>{
                console.log(e)
                reject(e)
              })
        })         
        .catch((err) => {
          console.log(err)
          reject(err)
        })
      })
      
    
    
    insertFile.then((a) => {  
      return response.status(200).send('ok') 
    }).catch((err)=>{
      console.log(err)
      return response.status(500).send({error: 'Erro inesperado'}) 
    })
    
  },

  async delete(request, response) {    
    const { id } = request.params
    const id_doador  = request.headers.authorization    
    var foto = 0
    const animal = await connection('animal')
    .select('id_doador')
    .first()
    .where('id_doador', '=',id_doador)
    .catch(() => {
      return response.status(401).json({ error: 'Erro inesperado' })
    })

    if(animal==undefined){
      return response.status(401).json({ error: 'Operation not permitted.' })
    }
    if (animal.id_doador != id_doador) {
      return response.status(401).json({ error: 'Operation not permitted.' })
    }
    

    const getFoto = new Promise(async (resolve, reject) => {
      await connection('animal')
      .select('foto')
      .first()
      .where('id', '=', id)
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        reject(err)        
      })
    })
    await getFoto.then((data) => {
      foto = data.foto
      console.log(data.foto)
    }).catch((err) => {
      console.log(err)
      return response.status(500).send({error: 'Erro inesperado'}) 
    })

    await connection('animal')
      .where('id', id)
      .delete()
      .then(async () => {
        try {
          ssh.connect({
              host: '167.114.1.72',
              username: 'adotesto',
              privateKeyPath: './id_rsa',
              passphrase: 'eE!20039807',
            })
            .then(() => {
              ssh.execCommand('rm resize_'+foto, { cwd:'public_html/files' }).then(() => {
                imagekit.listFiles({
                  searchQuery : 'name = "resize_'+foto+'"'
                }).then((result) => {
                  console.log(result);
                  imagekit.deleteFile(result[0].fileId).then(() => {
                    return response.status(200).send('ok')
                  }).catch(() => { 
                    return response.status(500).send({error: 'Erro inesperado'}) 
                  })
                }).catch(() => {
                  return response.status(500).send({error: 'Erro inesperado'}) 
                })
              }).catch(() => {
                return response.status(500).send({error: 'Erro inesperado'}) 
              })
            })
            .catch(() => {
              return response.status(500).send({error: 'Erro inesperado'}) 
            })
          
        } catch (e) {
          console.log(e)
          return response.status(500).send({error: 'Erro inesperado'}) 
        }
    })

  }
}
