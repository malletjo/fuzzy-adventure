import Meta from '../models/meta.model';
import moment from 'moment';
import config from '../../config/env';
import APIError from '../helpers/APIError';

import { MetasSerializer, MetaSerializer } from '../serializers/meta.serializer';

// rename so we don't mess with the model name
import { meta as metaExtractor }  from '../helpers/tags';

import { test } from '../helpers/tags';

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  Meta.get(id)
    .then((meta) => {
      req.meta = meta; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(MetaSerializer.serialize(req.meta));
}

function search(req, res, next) {

  let { search, page = 1 } = req.query;

  // Need it to convert to int otherwise it crash
  page = parseInt(page, 10);
  const skip = (page-1) * config.search.perPage;
  
  Meta.searchBySiteName(search, config.search.perPage, skip)
    .then((metas) => {
      res.json(MetasSerializer.serialize(metas));
    })
    .catch(e => next(e));
}

/**
 * Create new meta
 * @property {string} req.body.url - The url we want to extract the data
 * @returns {Meta}
 */
function create(req, res, next) {
  const url = req.body.url;

  // set params (qs) to force if you want to parse again the url
  const force = req.query.force == 'true' || false;

  // Look into DB first to avoid re-parsing
  Meta.getByUrl(url)
    .then((meta) => {
      // Look if it's more than X days old (@see config for ttl)
      const date = moment(meta.updatedAt).add(config.ttl.meta, 'seconds');
      if (date <= moment() || force) {
        metaExtractor.extract(url).then((metadata) => {
            
            meta.data = metadata;
            meta.updatedAt = Date.now();

            meta.save()
              .then((currentMeta) => res.json(MetaSerializer.serialize(currentMeta)))
              .catch(e => next(e));
        })
        .catch(e => next(e));
      } else {
        // data not expired yet, just return the obj
        return res.json(MetaSerializer.serialize(meta));        
      }
    })
    .catch(e => {
      // So the current url is not in the DB, parse it
      metaExtractor.extract(url).then((metadata) => {

        let obj = new Meta();
        obj.url = url;
        obj.data = metadata;

        obj.save()
          .then((currentMeta) => res.json(MetaSerializer.serialize(currentMeta)))
          .catch(e => next(e)); 
      })
      .catch(e => next(e));      
    });
}


/**
 * Get meta list (really similar to search (not requested by spec))
 *
 * @property {number} req.query.skip - Number of metas to be skipped.
 * @property {number} req.query.limit - Limit number of metas to be returned.
 * @returns {Meta[]}
 */
function list(req, res, next) {
  let { limit = 50, skip = 0 } = req.query;

  // Not sure how the boilerplate make it work
  // Need it to convert to int otherwise it crash
  limit = parseInt(limit, 10);
  skip = parseInt(skip, 10);

  Meta.list({ limit, skip })
    .then(metas => {
      res.json(MetasSerializer.serialize(metas))
    })
    .catch(e => next(e));
}

/**
 * Delete meta
 * @returns {User}
 */
function remove(req, res, next) {
  const meta = req.meta;
  meta.remove()
    .then(meta => {
      // http://jsonapi.org/format/#crud-deleting-responses-204
      res.status(204).end();
    })
    .catch(e => next(e));
}

export default { load, get, create, list, remove, search };
