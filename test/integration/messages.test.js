const assert = require('chai').assert;
const config = require('config');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const status = require('http-status');

const Server = require('../../src/server');
const server = Server.bootstrap(config);
const app = server.app.callback();

const fixtures = require('./fixtures');
const Store = require('../../src/store');
const store = new Store(config.get('store'));

suite('/messages/:id', function() {
  suiteSetup(async function() {
    this.authToken = jwt.sign(
      { username: 'testUser' },
      fs.readFileSync('test/auth-private.key'),
      { algorithm: 'ES256' }
    );
  });
  setup(async function() {
    await fixtures.populate(store);
  });
  teardown(function() {
    fixtures.depopulate(store);
  });

  suite('DELETE', function() {
    test('default pages', function() {
      return request(app)
        .delete('/messages/1')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.authToken)
        .then(res => {
          assert.equal(res.status, status.NO_CONTENT);
        })
        .then(() => {
          // Check db is changed
          store.messageStore.models.message
            .count()
            .then(total => assert.equal(total, 1));
        });
    });
    test('Not Found', function() {
      return request(app)
        .delete('/messages/7826722')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.authToken)
        .then(res => {
          assert.ok(res.status, status.NOT_FOUND);
        });
    });
  });

  suite('GET', function() {
    test('default pages', function() {
      return request(app)
        .get('/messages/1')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.authToken)
        .then(res => {
          assert.equal(res.status, status.OK);
          assert.deepEqual(res.body, {
            id: 1,
            text: 'This is a test 📙',
            owner: '1',
            createdAt: '2019-01-01T00:00:00.000Z',
            updatedAt: '2019-01-01T00:00:00.000Z'
          });
        });
    });
    test('Not Found', function() {
      return request(app)
        .get('/messages/7826722')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.authToken)
        .then(res => {
          assert.ok(res.status, status.NOT_FOUND);
        });
    });
  });
});

suite('/messages', function() {
  suiteSetup(async function() {
    this.authToken = jwt.sign(
      { username: 'testUser' },
      fs.readFileSync('test/auth-private.key'),
      { algorithm: 'ES256' }
    );
  });
  setup(async function() {
    await fixtures.populate(store);
  });
  teardown(function() {
    fixtures.depopulate(store);
  });

  suite('GET', function() {
    test('default pages', function() {
      return request(app)
        .get('/messages')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.authToken)
        .then(res => {
          assert.equal(res.status, status.OK);
          assert.deepEqual(res.body.messages, [
            {
              id: 1,
              text: 'This is a test 📙',
              owner: '1',
              createdAt: '2019-01-01T00:00:00.000Z',
              updatedAt: '2019-01-01T00:00:00.000Z'
            },
            {
              id: 2,
              text: 'This is another test 📙',
              owner: '2',
              createdAt: '2019-01-01T00:00:00.000Z',
              updatedAt: '2019-01-01T00:00:00.000Z'
            }
          ]);
        });
    });
    test('limit=1&page=2', function() {
      return request(app)
        .get('/messages?page=2&limit=1')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.authToken)
        .then(res => {
          assert.equal(res.status, status.OK);
          assert.deepEqual(res.body.messages, [
            {
              id: 2,
              text: 'This is another test 📙',
              owner: '2',
              createdAt: '2019-01-01T00:00:00.000Z',
              updatedAt: '2019-01-01T00:00:00.000Z'
            }
          ]);
        });
    });
  });
});
