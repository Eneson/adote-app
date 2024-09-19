
const connection  = require('../database/connection')

var sharp = require('sharp');
var ImageKit = require("imagekit");
const fsPromises = require('fs').promises;


var imagekit = new ImageKit({
  publicKey : "public_8IYkWTIrXKNBNHAc5HEOTMjc/ws=",
  privateKey : "private_KkVCTaVWQ2ZTYiB423cX9H7Gmss=",
  urlEndpoint : "https://ik.imagekit.io/adote/"
});

module.exports = {
  async index(request, response) {    
    const { page = 1 } = request.query

    const [count] = await connection('animal').count()
    
    const animal = await connection('animal')
      .join('user', 'user.id_user', '=', 'animal.id_user')
      .limit(10)
      .offset((page - 1) * 10 )
      .select([
        'animal.*',
        'user.nome',
        'user.email',
        'user.telefone',
      ])      
    response.header('X-Total-Count', count['count(*)'])    
    return response.json(animal)
    
  },
  async myAnimals(request, response){
    const id_user = request.usuario.id_user
    await connection('animal')
    .join('user', 'user.id_user', '=', 'animal.id_user')
    .select([
      'animal.*',
      'user.nome',
      'user.email',
      'user.telefone'
    ])     
    .then((data) => {
      if(data.length == 0){
        return response.json([])
      }
      return response.json(data)
    }).catch((err) => {
      return response.status(400).send({ error: err })
    })
    
  },

  async create(request, response) {
    const { filename } = request.file 
    const { FotoName, Nome, Descricao, DataNasc, Sexo, Tipo, Vacina, id_user, Vermifugado, Castrado} = request.body
    const Foto = filename
    const foto_resize = 'resize_'+FotoName
    
    console.log(filename)
    console.log(request.body)
    
    const insertFile = new Promise((resolve, reject) => {
      sharp('./uploads/'+Foto).resize(441,544).jpeg({quality : 100}).toFile('./uploads/'+foto_resize)
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
                    'FotoName':a.name,
                    Tipo,
                    Vacina,
                    id_user,
                    Vermifugado,
                    Castrado
                  }).then(() => {
                    console.log('insertttttttttttttttttttttttttt')
                    resolve(a)
                  }).catch((err) => {
                    console.log('Erroooooooo Inserttttttttttt')
                    console.log(err)
                    reject(err)
                  })
                })
                .catch((err) => {
                  console.log('Erroooooooo Inserttttttttttt')
                  console.log(err)
                  reject(err)
                })
              }).then(() => {
              }).catch((e)=>{
                console.log('Erroooooooo Inserttttttttttt')
                console.log(e)
                reject(e)
              })
        })         
        .catch((err) => {
          console.log('Erroooooooo Inserttttttttttt')
          console.log(err)
          reject(err)
        })
    })
      
    insertFile.then((a) => {  
      return response.status(200).send('ok') 
    }).catch((err)=>{
      return response.status(500).send({error: 'Erro inesperado'}) 
    })
    
  },

  async delete(request, response) {
    const { id } = request.params 
    var foto = 0    
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
    }).catch((err) => {
      return response.status(500).send({error: 'Erro inesperado'}) 
    })

    await connection('animal')
      .where('id', id)
      .delete()
      .then(async () => {
            imagekit.listFiles({
              searchQuery : 'name = "resize_'+foto+'"'
            }).then((result) => {
              imagekit.deleteFile(result[0].fileId).then(() => {
                return response.status(200).send('ok')
              })
            })
    }).catch(() => {
      return response.status(500).send({error: 'Erro inesperado'}) 
    })

  },

  async update(request,response){
    if(request.file == undefined){
      console.log('request.file undefined')
      const { id_user, id, Nome, Descricao, DataNasc, Sexo, Tipo, Vacina, Vermifugado, Castrado} = request.body   

      await connection('animal').update({
        Nome,
        Descricao,
        DataNasc,
        Sexo,
        Tipo,
        Vacina,
        id_user,
        Vermifugado,
        Castrado
      }).where('id', id).then(() => {
        return response.status(200).send('ok') 
      }).catch((err) => {
        return response.status(500).send({error: 'Erro inesperado'}) 
      })
      

    }else{
      const { filename } = request.file 
      const { id, FotoName, Nome, Descricao, DataNasc, Sexo, Tipo, Vacina, Vermifugado, Castrado } = request.body   
      
      const foto_resize = 'resize_'+FotoName
      
      const Image_old2 = await connection('animal')
      .select([
        'animal.FotoName'
      ])
      .first()
      .where('id', id)

      const startIndex = Image_old2.FotoName;
      
    //resize_2024-09-18T00-06-22.513ZImagem1.jpg
      
        const insertFile = new Promise((resolve, reject) => {
          sharp('./uploads/'+filename).resize(441,544).jpeg({quality : 100}).toFile('./uploads/'+foto_resize)
            .then(async ()=>{
              console.log('foto_resize')
              console.log(foto_resize)
              console.log('Foto')
              console.log(FotoName)
                  await fsPromises.readFile('./uploads/'+foto_resize).then((fileBuffer) => {
                    imagekit.upload({
                      file : fileBuffer, 
                      useUniqueFileName: false,
                      fileName : foto_resize,  
                    }).then(async (a) => {                      
                      await connection('animal').update({
                        Nome,
                        Descricao,
                        DataNasc,
                        Sexo,
                        'FotoName':a.name,
                        Tipo,
                        Vacina,
                        Vermifugado,
                        Castrado
                      }).where('id', id).then((res) => {
                        console.log('res')
                        console.log(res)
                        resolve(a)
                      }).catch((err) => {
                        console.log(err)
                        reject(err)
                      })
                    })
                  }).then(() => {
                    imagekit.listFiles({
                      searchQuery : 'name = "'+startIndex+'"'
                    }).then((result) => {   
                      console.log('name = "'+startIndex+'"')          
                      imagekit.deleteFile(result[0].fileId)
                  }).catch((err) => {
                    console.log(err)
                  })
            })         
            .catch((err) => {
              console.log(err)
              reject(err)
            })
          })
        })        
        insertFile.then((a) => {  
          return response.status(200).send('ok') 
        }).catch((err)=>{
          return response.status(500).send({error: 'Erro inesperado'}) 
        })      
    }
  },
}
