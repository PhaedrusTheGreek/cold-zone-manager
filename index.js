
import catIndices from './server/routes/catIndices';
import openIndices from './server/routes/openIndices';
import closeIndices from './server/routes/closeIndices';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'cold-zone-manager',
    uiExports: {
      
      app: {
        title: 'Cold Zone Manager',
        description: 'You know, for index archives',
        main: 'plugins/cold-zone-manager/app'
      },
      
      injectDefaultVars(server, options) {
        return {
          coldZoneManagerOptions: options
        };
      }
      
      
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        filterAttribute: Joi.string().default('index.routing.allocation.require.box_type'),        
        filterValue: Joi.string().default('cold'),        
        reloadMs: Joi.number().integer().default(0),        
        maxOpenIndices: Joi.number().integer().default(10),        
      }).default();
    },

    
    init(server, options) {
      catIndices(server);
      openIndices(server);
      closeIndices(server);
    }
    

  });
};
