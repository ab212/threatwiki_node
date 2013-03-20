$(document).ready(function() {
	jQuery.getJSON("http://threatwiki.thesentinelproject.org/api/datapoint/soc/Iran,%20Islamic%20Republic%20of?callback=?", function(datapoints) {
		//console.log(datapoints);
		//2012-11-04T00:00:00.000Z
		tags = [];
		var ymdFormat = d3.time.format("%Y-%m-%d");
		datapoints.forEach(function(p) {
			p.event_date = ymdFormat.parse(moment.utc(p.event_date).format("YYYY-MM-DD"));
			p.created = ymdFormat.parse(moment.utc(p.created).format("YYYY-MM-DD"));
			//normalize tags
			p.tags.forEach(function(tag){
				tags.push({title: tag.title,total: 1});
			});
		});
		var crossdatapoints = crossfilter(datapoints);
		var all = crossdatapoints.groupAll();
		var byId = crossdatapoints.dimension(function(p) { return p._id; });

		var byStage = crossdatapoints.dimension(function(p) { return p.stage; });

		byStage.group().top(Infinity).forEach(function(p, i) {
			//console.log(p.key + ": " + p.value);
		});

		var byCreator = crossdatapoints.dimension(function(p) { return p.createdBy.name; });

		byCreator.group().top(Infinity).forEach(function(p, i) {
			//console.log(p.key + ": " + p.value);
		});

		var bySoc = crossdatapoints.dimension(function(p) { return p.soc; });

		bySoc.group().top(Infinity).forEach(function(p, i) {
			//console.log(p.key + ": " + p.value);
		});

		var byTags = crossdatapoints.dimension(function(p){return p.tags;});

		var crosstags = crossfilter(tags);

		var tagList = crosstags.dimension(function(p){return p.title;});
		tagList.group().top(Infinity).forEach(function(p, i) {
			//console.log(p.key + ": " + p.value);
		});
		var byLocation = crossdatapoints.dimension(function(p) {return [p.Location.latitude,p.Location.longitude]; });

		//Round to the month
		var byEventMonth = crossdatapoints.dimension(function(p) { return d3.time.month(p.event_date); });
		var byEventMonthGrouping = byEventMonth.group();

		var byCreatedMonth = crossdatapoints.dimension(function(p) { return d3.time.month(p.created); });
		byId.group().top(Infinity).forEach(function(p, i) {
			//console.log(p.key + ": " + p.value);
		});

		// Render the initial list of tag.
		var listtag = d3.select("#tag-list").data([taglist]);


		// Render the total.
		d3.selectAll("#total").text(crossdatapoints.groupAll().reduceCount().value());



		var width = 600,
		height = 730;

		//Geographic coordinates: 32 00 N, 53 00 E
		//todo calculate projection and scale automatically
		//http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
		var projection = d3.geo.albers()
			.scale(2000)
			.center([0, 32])
			//.parallels([-5,0])
			.rotate([-54, 0])
			.translate([width / 2, height / 2]);

		var path = d3.geo.path().projection(projection);

		path = path.projection(projection);

		var svg = d3.select(".container-fluid").append("svg")
			.attr("width", width)
			.attr("height", height)
			.data([iranjson]);
		
		function iranjson(div) {
			div.each(function() {
				d3.json("/mapfiles/iran.json", function(error, data) {
					//console.log(byId);
					svg.selectAll(".subunit")
						.data(topojson.object(data, data.objects.iranprovinces).geometries)
						.enter().append("path")
						//class name based on name of region
						.attr("class", function(d) { return "subunit";})
						.attr("d", path)
						//random color for each region of iran
						.style("fill", function() {
							return "hsl(" + Math.random() * 360 + ",100%,50%)";
						});
					//border between the regions
					svg.append("path")
						.datum(topojson.mesh(data, data.objects.iranprovinces, function(a, b) { return a != b; }))
						.attr("d", path)
						.attr("class", "subunit-boundary");

					//Datapoints mapping
					data = svg.selectAll("circle.points")
						.data(byLocation.group().top(Infinity).filter(function(d) { return d.value; }),function(d) { return d.key; });

					//draw circles
					circleenter=data.enter()
						.append("circle")
						.attr("class","points")
						.attr("id",function(d) { return d.title; })
						.attr("r",function(d) {
							//console.log(d);
							//console.log(100*(d.value/crossdatapoints.groupAll().reduceCount().value()));
							var ratio = 200*(d.value/crossdatapoints.groupAll().reduceCount().value());
							if (ratio<3){
								return 3;
							} else {
								return ratio;
							}
						})
						.attr("transform", function(d) {
							return "translate(" + projection([d.key[1],d.key[0]]) + ")";
						});
					//add number of datapoints in the circle as text elements
					/*textenter=data.enter()
						.append("text")
						.attr("class", "points-label")
						.attr("transform", function(d) {
								return "translate(" + projection([d.key[1],d.key[0]]) + ")";
							
						})
						.attr("dy", ".35em")
						.text(function(d) { return d.value; });*/
				});

			});
		}


		// Render the initial lists.
		var list = d3.selectAll(".list").data([datapointlist]);

// Renders the specified chart or list.
		function render(method) {
			d3.select(this).call(method);
		}

		function renderAll() {
			list.each(render);
			listtag.each(render);


			//svg.each(render);

			d3.select("#active").text((all.value()));
		}
		function updateAllPoints(){
			//TO CHANGE
			d3.selectAll("circle").remove();

			d3.selectAll(".points-label").remove();
			data = svg.selectAll("circle.points")
				//get all the remaining datapoints, we filter because crossfilter returns also datapoints with value 0 (if they have been filtered out)
				//see https://github.com/square/crossfilter/issues/12 for more details
				.data(byLocation.group().top(Infinity).filter(function(d) { return d.value; }),function(d) { return d.key; });
			//draw circles
			circleenter=data.enter()
				.append("circle")
				.attr("class","points")
				.attr("id",function(d) { return d.title; })
				.attr("r",function(d) {
					var ratio = 50*(d.value/all.value());
					if (ratio<3 && ratio >0){
						return 3;
					} else if (ratio>20){
						return 20;
					} else {
						return ratio;
					}

				})
				.attr("transform", function(d) {
						return "translate(" + projection([d.key[1],d.key[0]]) + ")";
				});
			//add number of datapoints in the circle as text elements
			/*textenter=data.enter()
				.append("text")
				.attr("class", "points-label")
				.attr("transform", function(d) {
						return "translate(" + projection([d.key[1],d.key[0]]) + ")";
					
				})
				.attr("dy", ".35em")
				.text(function(d) { return d.value; });*/

		}

		window.filter = function(tagname) {
			byTags.filterFunction(function (tag) {
				for(i=0; i<tag.length; i++) {
					if (tag[i].title==tagname){
						return true;
					}
				}
				return false;
			});
			renderAll();
			updateAllPoints();
		};

		window.reset = function(i) {
			byTags.filterAll(null);
			renderAll();
			updateAllPoints();
		};
		svg.each(render);


		renderAll();


// The table at the bottom of the page
		function datapointlist(div) {
			div.each(function() {
				var datapoints = d3.select(this).selectAll(".datapoint").data(byId.top(Infinity),function(d) { return d._id; });

				var datapointsEnter = datapoints.enter().append("div").attr("class","datapoint");
				var dateformat = d3.time.format("%B %d, %Y");

				datapointsEnter.append("div")
					.attr("class", "serialnumber")
					.text(function(d) { return d.serialNumber; });

				datapointsEnter.append("div")
					.attr("class", "title")
					.text(function(d) { return d.soc; });

				datapointsEnter.append("div")
					.attr("class", "title")
					.text(function(d) { return d.title; });

				datapointsEnter.append("div")
					.attr("class", "stage")
					.text(function(d) { return d.stage; });	

				datapointsEnter.append("div")
					.attr("class", "title")
					.text(function(d) { return dateformat(d.event_date); });

				datapoints.exit().remove();

				datapoints.order();
			});
		}

		function taglist(div) {
			div.each(function() {
				var tags = d3.select(this).selectAll(".tag").data(tagList.group().top(Infinity),function(d) { return d.key; });
				
				var tagsEnter = tags.enter().append("div").attr("class","tag");

				tagsEnter.append("a")
					.attr("class", "title")
					//TODO not have javascript directly in the link
					.attr("href",function(d) { return ("javascript:filter('"+d.key+"')"); })
					.text(function(d) { return d.key; });
					tags.exit().remove();

					tags.order();
			});
		}


	});





	
});