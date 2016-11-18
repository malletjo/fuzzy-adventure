import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Metas APIs', () => {
  const source = {
    "url": "http://lapresse.ca"
  };

  const source1 = {
    "url": "http://www.lapresse.ca/arts/vie-de-stars/201611/17/01-5042599-le-petit-ami-de-la-fille-de-whitney-houston-condamne-a-payer-36-m.php"
  }

  const source2 = {
    "url": "https://github.com"
  }

  const source3 = {
    "url": "http://github.com"
  }  

  const meta = {
    "url": "lapresse.ca",
    "data": {
      "og-title": "LaPresse.ca | Actualités, Arts, International, Débats, Sports, Vivre, Voyage",
      "og-description": "Le site d'information francophone le plus complet en Amérique: Actualités régionales, provinciales, nationales et internationales",
      "twitter-title": "LaPresse.ca | Actualités, Arts, International, Débats, Sports, Vivre, Voyage",
      "twitter-description": "Le site d'information francophone le plus complet en Amérique: Actualités régionales, provinciales, nationales et internationales",
      "og-url": "http://www.lapresse.ca/",
      "og-type": "article",
      "og-site-name": "La Presse",
      "og-locale": "fr_CA",
      "twitter-card": "summary_large_image",
      "twitter-site": "@LP_LaPresse",
      "og-image": {
        "url": "http://static.lpcdn.ca/lpweb/Rmon1/img/mapresselogo.png"
      }
    },
  };

  let current;
  let github;
  describe('# POST /api/metas', () => {
    it('should create a new metas', (done) => {
      request(app)
        .post('/api/metas')
        .send(source)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.attributes.url).to.equal(meta.url);
          // Those 2 shouldn't change too often
          expect(res.body.data.attributes.data['og-title']).to.equal(meta.data['og-title']);
          expect(res.body.data.attributes.data['og-site-name']).to.equal(meta.data['og-site-name']);
          current = res.body.data;
          done();
        })
        .catch(done);                   
    });
    it('should create a new metas', (done) => {
      request(app)
        .post('/api/metas')
        .send(source1)
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);       
    });
    it('should create a new metas', (done) => {
      request(app)
        .post('/api/metas')
        .send(source2)
        .expect(httpStatus.OK)
        .then((res) => {
          github = res.body.data;
          done();
        })
        .catch(done);         
    });
  });

  describe('# GET /api/metas/:metaId', () => {
    it('should get meta details', (done) => {
      request(app)
        .get(`/api/metas/${current.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.attributes.data['og-title']).to.equal(current.attributes.data['og-title']);
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/metas with same url', () => {
    it('should not update to field updatedAd', (done) => {
      request(app)
        .post('/api/metas')
        .send(source)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.attributes.updatedAt).to.equal(current.attributes.updatedAt);
          done();
        })
        .catch(done);         
    });
  });


  describe('# GET /api/metas', () => {
    it('should get all metas', (done) => {
      request(app)
        .get('/api/metas')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/metas/search', () => {
    it('should return all', (done) => {
      request(app)
        .get('/api/metas/search')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(3);
          done()
        });
    });
  });

  describe('# GET /api/metas/search with params', () => {
    it('should return only from params', (done) => {
      request(app)
        .get('/api/metas/search?search=La%20Presse')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(2);
          done()
        });
    });
  });

  describe('# GET /api/metas/search with unknown params', () => {
    it('should return nothing', (done) => {
      request(app)
        .get('/api/metas/search?search=La%20Press')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(0);
          done()
        });
    });
  });  

  describe('# GET /api/metas/search with params and pagination', () => {
    it('should return first page', (done) => {
      request(app)
        .get('/api/metas/search?search=La%20Presse&page=1')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(2);
          done()
        });
    });
  }); 

  describe('# GET /api/metas/search with params and too far pagination', () => {
    it('should return first page', (done) => {
      request(app)
        .get('/api/metas/search?search=La%20Presse&page=34')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(0);
          done()
        });
    });
  });


  describe('# DELETE /api/metas', () => {
    it('should delete meta', (done) => {
      request(app)
        .delete(`/api/metas/${current.id}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.body).to.equal('');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/metas/search', () => {
    it('should return one since we deleted one', (done) => {
      request(app)
        .get('/api/metas/search?search=La%20Presse')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(1);
          done()
        });
    });
  });

  describe('# POST /api/metas with different protocal', () => {
    it('should NOT create a new meta', (done) => {
      request(app)
        .post('/api/metas')
        .send(source3)
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);         
    });
  });

  describe('# GET /api/metas/search with site_name ', () => {
    it('should return only 1 since the other post was duplicate url', (done) => {
      request(app)
        .get('/api/metas/search?search=GitHub')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.be.lengthOf(1);
          done()
        });
    });
  });

  describe('# POST /api/metas with force to update', () => {
    it('should update the meta', (done) => {
      request(app)
        .post('/api/metas?force=true')
        .send(source2)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.attributes['updated-at']).to.not.equal(github.attributes['updated-at']);
          done();
        })
        .catch(done);         
    });   
  });  

});






