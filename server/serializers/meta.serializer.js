import {Serializer as JSONAPISerializer} from 'jsonapi-serializer';
import config from '../../config/env';

// used only for listing
const MetasSerializer =  new JSONAPISerializer('metas', {
  attributes: ['url', 'data', 'createdAt', 'updatedAt'],
  topLevelLinks: {
    'self' : config.publicUrlApi + '/metas',
    'next' : config.publicUrlApi + '/metas',
    'prev' : config.publicUrlApi + '/metas',
    'fist' : config.publicUrlApi + '/metas',
    'last' : config.publicUrlApi + '/metas',
  },
  dataLinks: {
    'self': function(record, current) {
        return config.publicUrlApi + '/metas/' + current.id;
    }
  },
  meta: {
    'count': 'not implemented',
  }
});

// When you only return one resource, i don't want to included the topLevelLinks from the list
const MetaSerializer = new JSONAPISerializer('meta', {
    attributes: ['url', 'data', 'createdAt', 'updatedAt'],
    dataLinks: {
        'self': function(record, current) {
            return config.publicUrlApi + '/metas/' + current.id;
        }
    }    
});

export default {
    MetaSerializer,
    MetasSerializer,
}