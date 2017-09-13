import _ from 'lodash';
import boom from 'boom';

export default function (server) {

  const config = server.config();

  server.route({
    path: '/api/cold-zone-manager/online',
    method: 'POST',
    handler(req, reply) {
      try {
        reply(actOnIndices(req))
      } catch (err) {
        reply(boom.boomify(err));
      }
    }
  });


  async function actOnIndices(req) {

    const cluster = req.server.plugins.elasticsearch.getCluster('data');
    return await cluster.callWithRequest(req, 'indices.open', {
      index: req.payload.indices,
      expandWildcards: 'none'
    });

  }





}