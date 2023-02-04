const connection  = require('../database/connection')
const multer = require('multer');


module.exports = {
  async index(req, res) {
    const { page = 1 } = res.req.query

    const [count] = await connection('animal').count()

    await connection('animal')
          .limit(5)
          .offset((page - 1) * 5 )
          .select('*')
          .then((images) => {
            res.header('X-Total-Count', count['count(*)'])
              return res.json({
                  erro: false,
                  images,
                  url: "http://localhost:3333/uploads/"
              });          
            }).catch(() => {
                return res.status(400).json({
                    erro: true,
                    mensagem: "Erro: Nenhuma imagem encontrada!"
                });
            });
    
  },
  async getImage(req,res){    
    var fs = require('fs');
        fs.readFile('uploads/'+req.params.path, function(err, data) {
          if (err) throw err;
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data);
        });
  },

  async deletImage(req,res){    
    
  },
}
