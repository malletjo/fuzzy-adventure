import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * User Schema
 */
const MetaSchema = new mongoose.Schema({
  // We need to add a new field and not only base on og:url 
  // since when we have a redirection, we will always parse it
  // it's also possible the og doesn't contain any url, so we need to keep it outside of the data
  url: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

 MetaSchema.pre('save', function(next) {
  
  this.updatedAt = Date.now();

  // url are protocol insensitive, so strip it anyway
  this.url = this.url.replace(/^https?\:\/\//i, "");

  next();
 });

/**
 * Methods
 */
MetaSchema.method({
});

/**
 * Statics
 */
MetaSchema.statics = {
  searchBySiteName(name, limit, skip = 0, caseSensitive = true) {
    let params = {}
    // if no search specify, just return everything
    if (name) {
      params = {
        'data.ogSiteName': name
      }
    }
    if (caseSensitive) {
      return this.find(params)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    } else {
      // Use regex for case insensitive if needed (Not in the specs)
    }
  },

  /**
  * Find meta based on the url
  * @param {string} url
  * @return {Promise<User, APIError>}
  */
  getByUrl(url) {
    // Store directly in DB the stripped url (protocol removed) (spec request)
    // Don't need to use a regex anymore
    const strippedUrl = url.replace(/^https?\:\/\//i, "");
    return this.findOne({
      'url': strippedUrl
    })
    .exec()
    .then((meta) => {
      if (meta) {
        return meta;
      } else {
        return Promise.reject(new Error("This url doesn't exist"));
      }
    });
  },

  /**
   * Get meta
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    // validate ObjectId directly here for now
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return this.findById(id)
        .exec()
        .then((meta) => {
          if (meta) {
            return meta;
          }
          const err = new APIError('No such meta exists!', httpStatus.NOT_FOUND);
          return Promise.reject(err);
        });      
    } else {
      throw new APIError('Invalid id', httpStatus.NOT_FOUND);
    }
  },

  /**
   * List meta in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<Meta[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * @typedef User
 */
export default mongoose.model('Meta', MetaSchema);
