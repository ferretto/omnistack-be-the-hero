const connection = require('../database/connection');

module.exports = {

  async create(request, response){

      const { title, description, value } = request.body;

      const ong_id = request.headers.authorization;

      const [id] = await connection('incidents').insert({
        title, description, value, ong_id
      });

      return response.json({ id });
    },
    async index(request, response){
      const { page = 1 } = request.query;
      const { page_size = 5 } = request.query;

      const [count] = await connection('incidents').count();

      response.header('X-Total-Count', count['count(*)'])

      const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', 'incidents.ong_id')
        .limit(page_size).offset((page-1)*page_size).select(['incidents.*','ongs.name','ongs.email','ongs.whatsapp','ongs.city','ongs.uf']);
      return response.json(incidents)
    },
    async delete(request, response){
      const { id } = request.params;
      const ong_id = request.headers.authorization;
      // console.log(request.headers);

      const incident = await connection('incidents').where('id', id).select('ong_id').first();

      if (incident == undefined){
        return response.status(404).json( {error: 'Incident not found.'} );
      }

      if (ong_id != incident.ong_id) {
        return response.status(401).json( {error: 'Operation not permitted.'} );
      }

      await connection('incidents').where('id',id).delete();

      return response.status(204).send();
    }
}
