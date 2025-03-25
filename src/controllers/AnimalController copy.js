
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
    const { page = 1, origem, adotado  } = request.query
    let limit = origem === 'web' ? 6 : 10;

    console.log(origem)

    const [count] = await connection('animal').where('adotado', adotado).count()
    
    const animal = await connection('animal')
      .where('adotado', adotado) // Aplica o filtro `adotado` na seleção principal
      .join('user', 'user.id_user', '=', 'animal.id_user')
      .orderBy('id')
      .limit(limit)
      .offset((page - 1) * limit )
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
    .where('animal.id_user', '=', id_user)
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
    const { files } = request; // Alterado para lidar com múltiplos arquivos
    const { Nome, Descricao, DataNasc, Sexo, Tipo, Vacina, id_user, Vermifugado, Castrado } = request.body;
    const Trx_Create_animal = await connection.transaction();

    try {
      const fotoResizes = await Promise.all(
        files.map(async (file) => {
          const FotoName = file.filename;
          const foto_resize = `resize_${FotoName.replace(/[\s()]/g, '_')}`;
          
          // Redimensiona a imagem
          await sharp(`./uploads/${FotoName}`)
            .withMetadata()
            .resize(441, 544)
            .jpeg({ quality: 100 })
            .toFile(`./uploads/${foto_resize}`);

          // Lê o arquivo redimensionado
          const fileBuffer = await fsPromises.readFile(`./uploads/${foto_resize}`);

          // Faz upload para o ImageKit
          await imagekit.upload({
            file: fileBuffer,
            useUniqueFileName: false,
            fileName: foto_resize,
          });

          return foto_resize; // Retorna o nome do arquivo redimensionado
        })
      );

      // Insere os dados no banco com as fotos associadas
        await Trx_Create_animal('animal').insert({
          Nome,
          Descricao,
          DataNasc,
          Sexo,
          FotoName: JSON.stringify(fotoResizes), // Armazena as fotos como um array em JSON
          Tipo,
          Vacina,
          id_user,
          Vermifugado,
          Adotado: 0,
          Castrado,
        });

        await Trx_Create_animal.commit();
        return response.status(200).send('ok');
    } catch (err) {
      console.log(err)
      await Trx_Create_animal.rollback();
      return response.status(500).send({ error: 'Erro inesperado' });
    }
  
  },

  async delete(request, response) {
    const { id } = request.params 
    const Trx_delete_animal = await connection.transaction();

    const delete_animal = new Promise(async (resolve, reject) => {  
      Trx_delete_animal('animal')
        .select('FotoName')
        .first()
        .where('id', '=', id)
        .then(async (data) => {
          const { FotoName } = data
          await Trx_delete_animal('animal')
          .where('id', id)
          .delete()
          .then(async () => {
                imagekit.listFiles({
                  searchQuery : 'name = '+ FotoName
                }).then((result) => {
                  imagekit.deleteFile(result[0].fileId).then(() => {
                    resolve("Deletado com sucesso!")
                  }).catch((err) => {
                    reject(new Error(err))
                  })
                }).catch((err) => {              
                  reject(new Error(err))
                })
          }).catch(() => {
            reject(new Error('Não foi possível deletar o animal')) 
          })          
          .catch((err) => {     
            reject(new Error(err))
          })
      })
    })    
    delete_animal.then(() => {
      Trx_delete_animal.commit()
      return response.status(200).send('ok') 
    })
    .catch((err) => {
      Trx_delete_animal.rollback()
      return response.status(500).send({error: 'Erro inesperado'})
    });
  },
  
  async update(request,response){    
    const trx = await connection.transaction();
    
    const { files } = request; // Alterado para lidar com múltiplos arquivos
    
    
    const update_animal = new Promise(async (resolve, reject) => {
      const { id_user, FotoName, id, Nome, Descricao, DataNasc, Sexo, Tipo, Vacina, Vermifugado, Castrado} = request.body
      const Adotado = request.body.Adotado?request.body.Adotado:0

      if(request.file == undefined){
        await trx('animal').update({
          Nome,
          Descricao,
          DataNasc,
          Sexo,
          Tipo,
          Vacina,
          id_user,
          Vermifugado,
          Castrado,
          Adotado
        }).where('id', id).then(() => {
          resolve("Atualizado com sucesso!")
        }).catch((err) => {
          reject(new Error('Não foi possível atualizar as informações  do animal')) 
        })  
      }else{
        const { filename } = request.file
        
        const foto_resize = 'resize_'+FotoName.replace(/[\s()]/g, '_');
        
        const Image_old2 = await trx('animal')
        .select([
          'animal.FotoName'
        ])
        .where('id', id)
        .first()

        const startIndex = Image_old2.FotoName.replace(/[\s()]/g, '_'); 
        await connection('animal').update({
          Nome,
          Descricao,
          DataNasc,
          Sexo,
          'FotoName':foto_resize,
          Tipo,
          Vacina,
          id_user,
          Vermifugado,
          Castrado
        }).where('id', id).then(() => {
          
          sharp('./uploads/'+filename).resize(441,544).jpeg({quality : 100}).toFile('./uploads/'+foto_resize)
            .then(async ()=>{
                  await fsPromises.readFile('./uploads/'+foto_resize)
                    .then((fileBuffer) => {                      
                      imagekit.upload({
                        file : fileBuffer, 
                        useUniqueFileName: false,
                        fileName : foto_resize,  
                      }).then(async (a) => {                         
                        //Deletando imagem
                        imagekit.listFiles({
                          searchQuery : 'name = "'+startIndex+'"'
                        }).then((result) => {  
                            imagekit.deleteFile(result[0].fileId)
                        }).finally(() => {
                          //Resolvendo a promise 
                          resolve("Atualizado com sucesso!")
                        })
                      }).catch((err) => {
                        reject(err)
                      })
                    })      
                    .catch((err) => {
                      reject(err)
                    })
          }).catch((err) => {              
            reject(err) 
          })
        }).catch((err) => {
          reject(err)
        })        
      }
    })

    update_animal.then(() => {
      trx.commit()
      return response.status(200).send('ok') 
    })
    .catch(() => {
      trx.rollback()
      return response.status(500).send({error: 'Erro inesperado'})
    });

  },
  async update_Adotado(request,response){    
    const { id } = request.params 
    const { Adotado } = request.body
    await connection('animal').update({
      Adotado: Adotado
    }).where('id', id).then(() => {
      return response.status(200).send('ok') 
    }).catch((err) => {
      return response.status(500).send({error: 'Erro inesperado'})
    })  
      


  },
}
