import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

describe('# GET /api/404', () => {
  it('should return 404 status', (done) => {
    request(app)
      .get('/api/404')
      .expect(httpStatus.NOT_FOUND)
      .then((res) => {
        expect(res.body.message).to.equal('Not Found');
        done();
      })
      .catch(done);
  });
});

describe('# Error Handling', () => {
  it('should handle mongoose when id is not objectId', (done) => {
    request(app)
      .get('/api/metas/56z787zzz67fc')
      .expect(httpStatus.NOT_FOUND)
      .then((res) => {
        expect(res.body.message).to.equal('Not Found');
        done();
      })
      .catch(done);
  });
});
