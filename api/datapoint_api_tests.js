//To execute the tests, go in the console and type: node datapoint_api_tests.js 
var vows = require('vows')
, assert = require('assert')
, tobi = require('tobi');

var serverUrl = 'localhost';
var serverPort = 3000;

var api = {
    get: function (path) {
        return function () {
            var browser = tobi.createBrowser(serverPort, serverUrl);
            browser.get(path, this.callback.bind(this, null));
        };
    },
    //this is an empty POST, without any data, since we are not logged in anyway
    post: function (path, data) {
        return function () {
            var browser = tobi.createBrowser(serverPort, serverUrl);
            browser.post(path, this.callback.bind(this, null));
        };
    },
    //this is an empty PUT, without any data, since we are not logged in anyway
    put: function (path, data) {
        return function () {
            var browser = tobi.createBrowser(serverPort, serverUrl);
            browser.put(path, this.callback.bind(this, null));
        };
    }
};

function assertStatus(code) {
    return function (e, res) {
        assert.equal (res.statusCode, code);
    };
}

vows.describe('Test Datapoint API').addBatch({
    'GET /api/datapoint': {
        topic: api.get('/api/datapoint'),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of datapoints': function (res) {
            assert.isArray (res.body);
        }
    },
    'GET /api/datapoint/delete/:id': {
        topic: api.get('/api/datapoint/delete/123'),
        'should respond with a 200 OK': assertStatus(200)
    },
    'POST empty data to /api/datapoint without being logged in': {
        topic: api.post('/api/datapoint'),
        //TODO: should it return 200 or access denied? right now we return null from the API, so its like no data, so 200 OK
        'should respond with a 200 OK': assertStatus(200)
    },'PUT(update) empty data to /api/datapoint/:id': {
        topic: api.put('/api/datapoint/1224444'),
        //TODO: should it return 200 or access denied? right now we return null from the API, so its like no data, so 200 OK
        'should respond with a 200 OK': assertStatus(200)
    }

}).run(); // Run it