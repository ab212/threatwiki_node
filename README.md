How to use (for all versions):
- Make sure you have an instance of mongodb running
- npm install -d
- node app.js
- Point your browser to [http://localhost:3000](http://localhost:3000)

Tested and supported only under Node.js 0.8.X

Version 3.0 (stable)
- URL [https://github.com/thesentinelproject/threatwiki_node/tree/v3.0](https://github.com/thesentinelproject/threatwiki_node/tree/v3.0)
- If you want to login with the Google Apps authentication, you need a @thesentinelproject.org domain and also need to specify the NODE_ENV to production
	ie: export NODE_ENV=production
- To auto-login without using Google Apps authentication, specify the NODE_ENV to development
	ie: export NODE_ENV=development

Tests
The tests are only testing the REST API
To run the tests, go to the api folder
Type: node api_tests.js
Tests are currently not working under version 3.0, see issue #58 for details

Installed and running on [http://threatwiki.thesentinelproject.org/](http://threatwiki.thesentinelproject.org/)