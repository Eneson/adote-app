const connection  = require('../database/connection')

module.exports = {
  async index(request, response) {   
    const { page = 1 } = request.query
    const [reports] = await connection('reports').count()

    const animal = await connection('reports')
    .join('animal', 'animal.id', '=', 'reports.animal_id')
    .join('user', 'user.id_user', '=', 'reports.id_user')
    .offset((page - 1) * 10 )
    .limit(10)
    .select([
      'reports.*',
      'animal.Nome',
      'user.nome',
      'user.id_user',
    ])
    response.header('X-Total-Count', reports['count(*)']) 
    return response.json(animal)       
  },
  async count(request, response) {
    const { animal_id } = request.params
    
    const [count] = await connection('reports').where('animal_id', animal_id).count()   
    
      return response.json(count['count(*)'])
  },
  async create(request, response) {
    const { desc, animal_id, animal_nome, doador_tel, user_tel, user_nome } = request.body
    const {email, id_user, nome, telefone} = request.usuario
    
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    const data = year + "-" + month + "-" + date
    
    
      await connection('reports')
      .insert({
        data: data,
        desc: desc,
        animal_id: animal_id,
        id_user: id_user
      })
      .then(() => {
        return response.status(200).send({mess: 'Denuncia feita!'})
      })
      .catch((e) => {    
        console.log(e)    
        return response.status(500).send({ error: 'Erro no servidor' })
        
      })

      
     

  },
  async delete(request, response){
    const { id } = request.params
      connection('reports')
        .where('reports_id', '=', id)
        .delete()
        .then(async () => {
          return response.status(200).send('ok')           
        }).catch(() =>{
          return response.status(500).send({error: 'Erro inesperado'})
        })
  }
}
