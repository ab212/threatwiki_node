#Threatwiki project no longer active
The threatwiki project is no longer active. All the data collected by The Sentinel Project during the life of this project has been migrated to the Conflict Traffic System: [http://cts.thesentinelproject.org](http://cts.thesentinelproject.org)

The code that was used to create this project is still available under the MIT License.

##Still want to see the visualizations?

If you are curious about how the visualizations looked like in order to reproduce something similar, they are still available at those URLs. Keep in mind that the data displayed is not up to date.

- Iran (Bahai) visualization: http://vast-journey-7849.herokuapp.com/iranvisualization
- Burma visualization: http://vast-journey-7849.herokuapp.com/burmavisualization
- Kenya Visualization: http://vast-journey-7849.herokuapp.com/kenyavisualization

##Relevant Links

- Technical blog explaining our visualization:
http://jeromegagnonvoyer.wordpress.com/2013/04/17/creating-a-data-visualization-tool-using-d3-js-crossfilter-and-leaflet-js/

- Blog post of our launch:
http://thesentinelproject.org/introducing-threatwiki-3-0-warsaw-a-big-update-for-sentinel-projects-genocide-risk-tracking-platform/

- Technical blog post explaining how to access the Threatwiki API:
http://thesentinelproject.org/learn-how-to-access-the-sentinel-project-open-data-with-our-apis/

- Blog post on the launch of our Burma visualization:
http://thesentinelproject.org/launch-of-a-new-visualization-of-the-escalating-persecution-of-the-rohingya-muslim-minority-in-burma/

- Blog post on the launch of our Iran - Bahai visualization:
http://thesentinelproject.org/new-visualization-and-hate-crime-mapping-tool-can-help-prevent-genocide/

##Installation instructions

How to use (for all versions):

- Make sure you have an instance of mongodb running
- npm install -d
- bower install
- node app.js
- Point your browser to [http://localhost:3000](http://localhost:3000)

Tested and supported only under Node.js 0.8.X

We try to keep the master branch as stable as possible so feel free to get the most recent version out of git to play with.

- If you want to login with the Google Apps authentication, you need a @thesentinelproject.org domain and also need to specify the NODE_ENV to production
	ie: export NODE_ENV=production
	
- To auto-login without using Google Apps authentication, specify the NODE_ENV to development
	ie: export NODE_ENV=development