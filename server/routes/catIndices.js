import _ from 'lodash';
import boom from 'boom';

export default function (server) {

  const config = server.config();
  const filterAttribute = config.get('cold-zone-manager.filterAttribute');
  const filterValue = config.get('cold-zone-manager.filterValue');

  server.route({
    path: '/api/cold-zone-manager/indices',
    method: 'GET',
    handler(req, reply) {

      Promise.all([catIndices(req), getClusterState(req)]).then((response) => {
        reply(coldIndicesOnly(response[0], response[1]));
       }).catch(err => {
        reply(boom.boomify(err));
       });

    }
  });

  function coldIndicesOnly(indices, state) {
    return indices.filter(
      e => {
        if ( _.get(state.metadata.indices[e.index].settings, filterAttribute) === filterValue ){
          if (state.routing_table.indices[e.index]) {
            addShardStats(e, state.routing_table.indices[e.index].shards);
          }
          return true;
        } else {
          return false;
        }
      }
    );
  }

  function addShardStats(e, shardData) {
    e.stateCount = { STARTED:0, RELOCATING:0, INITIALIZING:0, UNASSIGNED:0 };
    e.totalShards = parseInt(e.pri) + (parseInt(e.pri) * parseInt(e.rep));
    // e.shardData = shardData;
    for (var id in shardData) {
      for (let shard of shardData[id]) {
        e.stateCount[shard.state]++;
      }
    };
    e.startedPercent = ( e.stateCount.STARTED +  e.stateCount.RELOCATING ) / e.totalShards;
  }


  async function catIndices(req) {

    const cluster = req.server.plugins.elasticsearch.getCluster('data');
    return await cluster.callWithRequest(req, 'cat.indices', { 'format': 'json' });

  }


  async function getClusterState(req) {

    const cluster = req.server.plugins.elasticsearch.getCluster('data');
    return await cluster.callWithRequest(req, 'cluster.state', { 
      'filterPath': ['metadata.indices', 'routing_table.indices']
     })

  }


}