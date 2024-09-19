const connection  = require('../database/connection')

module.exports = {
  async index(request, response) {
    const { animal_id } = request.params
    
    if(animal_id != undefined){
      const animal = await connection('reports')
      .join('animal', 'animal.id', '=', 'reports.animal_id')
      .join('user', 'user.id_user', '=', 'reports.user_id')
      .select([
        'reports.*',
        'animal.*',
        'user.*'
      ])
      return response.json(animal)
    }else{
      const [reports] = await connection('reports').count()
      return response.json(reports['count(*)'])
    }    
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
        animal_nome: animal_nome,
        user_nome: nome,
        user_tel: telefone,
        id_user: id_user
      })
      .then(() => {
        return response.status(200).send({mess: 'Denuncia feita!'})
      })
      .catch((e) => {        
        return response.status(500).send({ error: 'Erro no servidor' })
        
      })

      
     

  },
}
