//To execute the tests, go in the console and type: node api_tests.js 
var vows = require('vows')
, assert = require('assert')
, tobi = require('tobi');

var serverUrl = 'localhost';
var serverPort = 3000;
var defaultHeaders = { 'Content-Type': 'application/json' };
var currentTime = new Date();
var time2000 = new Date("January 1, 2000 00:00:01");


var month = currentTime.getMonth();
if(month <= 9)
    month = '0'+(month+1);

var day= currentTime.getDate();
if(day <= 9)
    day = '0'+day;

var api = {
    get: function (path) {
        return function () {
            var browser = tobi.createBrowser(serverPort, serverUrl);
            browser.get(path, this.callback.bind(this, null));
        };
    },
    post: function (path, data) {
        return function () {
            var browser = tobi.createBrowser(serverPort, serverUrl);
            browser.post(path, { body: JSON.stringify(data), headers: defaultHeaders }, this.callback.bind(this, null));
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
vows.describe('Test API').addBatch({
    //SECTION TO TEST DATAPOINT API
    'GET /api/datapoint': {
        topic: api.get('/api/datapoint'),
            //first we test that we get results from getting all datapoints
            'should respond with a 200 OK': assertStatus(200),
            'should return a list of datapoints if the DB contains some': function (res) {
                assert.isArray (res.body);
            },
            //We take the first datapoint that we receive when we get all datapoints, get the _id of it
            //call a nested test to /api/datapoint/:id and make sure they both are the same
            'Retrieve /api/datapoint/:id from the first datapoint retrieved in /api/datapoint':{
               topic: function (e, res) {
                var browser = tobi.createBrowser(serverPort, serverUrl);
                //we include the _id of the first datapoint result in the callback argument in order to compare it after
                browser.get('/api/datapoint/'+res[0]._id, this.callback.bind(this, null,res[0]._id));
                },
                'Both _id are equal': function (e,prevId,res){
                    assert.equal(res.body._id,prevId);
                }
            }
    },
    'GET /api/datapoint/delete/ random id number that doesnt exist': {
        topic: api.get('/api/datapoint/delete/123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isNull(res.body);
        }
    },
    'GET /api/datapoint/date/:date from Jan 1st 1970': {
        topic: api.get('/api/datapoint/date/0'),
        'should respond with a 200 OK': assertStatus(200),
        'should return an empty body': function (res) {
            assert.isEmpty (res.body);
        }
    },
    'GET /api/datapoint/date/after/ from Jan 1st 2000': {
        topic: api.get('/api/datapoint/date/after/'+time2000.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of datapoints in an array': function (res) {
            assert.isArray (res.body);
        }
    },
     'GET /api/datapoint/date/before/ todays date': {
        topic: api.get('/api/datapoint/date/before/'+currentTime.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of datapoints in an array': function (res) {
            assert.isArray (res.body);
        }
    },
    'GET /api/datapoint/date/range/ year 2000 to today': {
        topic: api.get('/api/datapoint/date/range/'+time2000.getTime().toString()+'/'+currentTime.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of datapoints in an array': function (res) {
            //console.log(res.body);
            assert.isArray (res.body);
        }
    },
    'POST empty data to /api/datapoint': {
        topic: api.post('/api/datapoint'),
        'should respond with a 400 bad request': assertStatus(400),
        'should be empty': function(res){
            assert.isUndefined(res.body);
        }
    },'PUT(update) empty data to /api/datapoint/:id random id number that doesnt exist': {
        topic: api.put('/api/datapoint/1224444'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isNull(res.body);
        }
    },'GET /api/datapoint/user/:username for a random user that doesnt exist': {
        topic: api.get('/api/datapoint/user/dummy'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },'GET /api/datapoint/location/:Location for a random location name': {
        topic: api.get('/api/datapoint/location/dummy123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
/* TODO: Currently disabled as this call to the API has been disabled before 2.0 release. See issue #44
    },'GET /api/datapoint/tag/:title for a random tag title': {
        topic: api.get('/api/datapoint/tag/dummy123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            //console.log(res);
            assert.isEmpty(res.body);
        }*/
    },'GET /api/datapoint/soc/:soc for a random soc title': {
        topic: api.get('/api/datapoint/soc/dummy123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    }



}).addBatch({
    //SECTION TO TEST SOC API
    'GET /api/soc': {
        topic: api.get('/api/soc'),
            //first we test that we get results from getting all SOCs
            'should respond with a 200 OK': assertStatus(200),
            'should return a list of SOC if the DB contains some': function (res) {
                assert.isArray (res.body);
            },
            //We take the first soc that we receive when we get all soc, get the _id of it
            //call a nested test to /api/soc/:id and make sure they both are the same
            'Retrieve /api/soc/:id from the first soc retrieved in /api/soc':{
               topic: function (e, res) {
                var browser = tobi.createBrowser(serverPort, serverUrl);
                //we include the _id of the first soc result in the callback argument in order to compare it after
                browser.get('/api/soc/'+res[0]._id, this.callback.bind(this, null,res[0]._id));
                },
                'Both _id are equal': function (e,prevId,res){
                    assert.equal(res.body._id,prevId);
                }
            }
    },
    'GET /api/soc/date/:date from Jan 1st 1970': {
        topic: api.get('/api/soc/date/0'),
        'should respond with a 200 OK': assertStatus(200),
        'should return an empty body': function (res) {
            assert.isEmpty (res.body);
        }
    },
    'GET /api/soc/date/after/ from Jan 1st 2000': {
        topic: api.get('/api/soc/date/after/'+time2000.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of soc in an array': function (res) {
            assert.isArray (res.body);
        }
    },
     'GET /api/soc/date/before/ todays date': {
        topic: api.get('/api/soc/date/before/'+currentTime.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of soc in an array': function (res) {
            assert.isArray (res.body);
        }
    },
    'GET /api/soc/date/range/ year 2000 to today': {
        topic: api.get('/api/soc/date/range/'+time2000.getTime().toString()+'/'+currentTime.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of soc in an array': function (res) {
            //console.log(res.body);
            assert.isArray (res.body);
        }
    },
    'GET /api/soc/title/:title for a random soc title': {
        topic: api.get('/api/soc/title/dummy123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },
    'GET /api/soc/user/:username for a random user that doesnt exist': {
        topic: api.get('/api/soc/user/dummy'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },
    'POST empty data to /api/soc without being logged in': {
        topic: api.post('/api/soc'),
        'should respond with a 401 unauthorized status': assertStatus(401),
        'should be empty': function(res){
            assert.isUndefined(res.body);
        }
    },
    'PUT(update) empty data to /api/soc/:id random id number that doesnt exist': {
        topic: api.put('/api/soc/1224444'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isNull(res.body);
        }
    },'GET /api/soc/delete/ random id number that doesnt exist': {
        topic: api.get('/api/soc/delete/123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isNull(res.body);
        }
    }
}).addBatch({
    //SECTION TO TEST TAG API
    
    'GET /api/tag': {
        topic: api.get('/api/tag'),
            //first we test that we get results from getting all tags
            'should respond with a 200 OK': assertStatus(200),
            'should return a list of tag if the DB contains some': function (res) {
                assert.isArray (res.body);
            },
            //We take the first tag that we receive when we get all tag, get the _id of it
            //call a nested test to /api/tag/:id and make sure they both are the same
            'Retrieve /api/tag/:id from the first ag retrieved in /api/tag':{
               topic: function (e, res) {
                var browser = tobi.createBrowser(serverPort, serverUrl);
                //we include the _id of the first ag result in the callback argument in order to compare it after
                browser.get('/api/tag/'+res[0]._id, this.callback.bind(this, null,res[0]._id));
                },
                'Both _id are equal': function (e,prevId,res){
                    assert.equal(res.body._id,prevId);
                }
            }
    },
    'GET /api/tag/soc/:soc for a random soc title': {
        topic: api.get('/api/tag/soc/dummy123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },
    'GET /api/tag/title/:title for a random tag title': {
        topic: api.get('/api/tag/title/dummy123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },
    'GET /api/tag/datapoint/:datapointid for a random datapoint id': {
        topic: api.get('/api/tag/datapoint/123456'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },
    'GET /api/tag/date/:date from Jan 1st 1970': {
        topic: api.get('/api/tag/date/0'),
        'should respond with a 200 OK': assertStatus(200),
        'should return an empty body': function (res) {
            assert.isEmpty (res.body);
        }
    },
    'GET /api/tag/date/after/ from Jan 1st 2000': {
        topic: api.get('/api/tag/date/after/'+time2000.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of tag in an array': function (res) {
            assert.isArray (res.body);
        }
    },
     'GET /api/tag/date/before/ todays date': {
        topic: api.get('/api/tag/date/before/'+currentTime.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of tag in an array': function (res) {
            assert.isArray (res.body);
        }
    },
    'GET /api/tag/date/range/ year 2000 to today': {
        topic: api.get('/api/tag/date/range/'+time2000.getTime().toString()+'/'+currentTime.getTime().toString()),
        'should respond with a 200 OK': assertStatus(200),
        'should return a list of tag in an array': function (res) {
            //console.log(res.body);
            assert.isArray (res.body);
        }
    },'GET /api/tag/user/:username for a random user that doesnt exist': {
        topic: api.get('/api/tag/user/dummy'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isEmpty(res.body);
        }
    },
    'POST empty data to /api/tag without being logged in': {
        topic: api.post('/api/tag'),
        'should respond with a 401 unauthorized status': assertStatus(401),
        'should be empty': function(res){
            assert.isUndefined(res.body);
        }
    },'PUT(update) empty data to /api/tag/:id random id number that doesnt exist': {
        topic: api.put('/api/tag/1224444'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isNull(res.body);
        }
    },'GET /api/tag/delete/ random id number that doesnt exist': {
        topic: api.get('/api/tag/delete/123'),
        'should respond with a 200 OK': assertStatus(200),
        'should be empty': function(res){
            assert.isNull(res.body);
        }
    }

}).run(); // Run it
