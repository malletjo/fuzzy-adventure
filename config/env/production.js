export default {
  env: 'production',
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  db: 'mongodb://localhost/express-mongoose-es6-rest-api-production',
  port: 4040,
  ttl: {
    meta: 60*60*24*2,
  },
  search: {
    perPage: 10,
  },  
  publicUrlApi: 'http://127.0.0.1:4040/api',
};
