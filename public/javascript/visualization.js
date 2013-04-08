$(document).ready(function() {
	//var host = "http://threatwiki.thesentinelproject.org";
	var host = "http://localhost:3000";
	jQuery.getJSON(host+"/api/datapoint/soc/Iran,%20Islamic%20Republic%20of?callback=?", function(datapoints) {
		tags = [];
		var ymdFormat = d3.time.format("%Y-%m-%d");
		datapoints.forEach(function(p) {
			p.event_date = ymdFormat.parse(moment.utc(p.event_date).format("YYYY-MM-DD"));
			p.created = ymdFormat.parse(moment.utc(p.created).format("YYYY-MM-DD"));
			//normalize tags
			if (typeof(p.tags)!='undefined'  && p.tags!==null){
			p.tags.forEach(function(tag){
					tags.push({title: tag.title,total: 1});
				});
			}
		});
		var crossdatapoints = crossfilter(datapoints);
		var all = crossdatapoints.groupAll();
		var byId = crossdatapoints.dimension(function(p) { return p._id; });

		var byStage = crossdatapoints.dimension(function(p) { return p.stage; });

		var byCreator = crossdatapoints.dimension(function(p) { return p.createdBy.name; });

		var bySoc = crossdatapoints.dimension(function(p) { return p.soc; });

		var byTags = crossdatapoints.dimension(function(p){return p.tags;});

		var crosstags = crossfilter(tags);


		var tagList = crosstags.dimension(function(p){return p.title;});

		var byLocation = crossdatapoints.dimension(function(p) {return [p.Location.latitude,p.Location.longitude]; });
		var byFullLocation = crossdatapoints.dimension(function(p) {return p.Location; });
		var tagsFiltered = false;
		var byEventDate = crossdatapoints.dimension(function(p) { return d3.time.day(p.event_date); });
		//byEventDate.group().top(Infinity).forEach(function(p, i) {
 		//	 console.log(p.key + ": " + p.value);
		//});
		// Render the initial list of tag.
		var listtag = d3.select("#tag-list").data([taglist]);

		// Render the total.
		d3.selectAll("#total").text(crossdatapoints.groupAll().reduceCount().value());

		var width = 535,
		height = 580;

		//Geographic coordinates: 32 00 N, 53 00 E
		//todo calculate projection and scale automatically
		//http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
		var projection = d3.geo.albers()
			.scale(1900)
			.center([0, 32])
			//.parallels([-5,0])
			.rotate([-54.5, 0])
			.translate([width / 2, height / 2]);

		var path = d3.geo.path().projection(projection);

		path = path.projection(projection);

		var svg = d3.select(".container-fluid").append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("class","map")
			.data([iranjson]);

		//the actual map
		function iranjson() {
			d3.json("/mapfiles/iran.json", function(error, data) {
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
				//because we want datapoints to be drawn AFTER the map
				updateDatapoints();
			});

		}
		//the datapoints on the map
		function updateDatapoints() {
			//Datapoints mapping
			d3.selectAll("circle").remove();
			var data = svg.selectAll("circle.points")
				.data(byLocation.group().top(Infinity).filter(function(d) { return d.value; }),function(d) { return d.key; });
			//nb of datapoints per location could be from 1 to 36
			var radius = d3.scale.sqrt()
				.domain([1, 36])
				.range([4, 16]);

			//draw circles
			circleenter=data.enter()
				.append("svg:a")
				.attr("xlink:href",function(d) { return ("javascript:filterLocation('"+d.key+"')"); })
				.append("circle")
				.attr("class","points")
				.attr("r",function(d) {
					return radius(d.value);
				})
				//opacity more transparent on bigger datapoints on the map (to be able to see whats behind)
				.style("fill-opacity",function(d) {
					if (radius(d.value)>8){
						return 0.6;
					} else {
						return 0.9;
					}
				})
				.attr("transform", function(d) {
					return "translate(" + projection([d.key[1],d.key[0]]) + ")";
				});
			data.exit().remove();
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
		var charts = [
		barChart()
			.dimension(byEventDate)
			.group(byEventDate.group())
			.x(d3.time.scale.utc()
				.domain([new Date(2011, 10,06), new Date()])
				.rangeRound([0, 960]))
			//.filter([new Date(2011, 10, 1), new Date()])
				//.ticks(d3.time.month, 1)
		];
		var chart = d3.selectAll(".chart")
			.data(charts)
			.each(function(chart) {
				chart
				.on("brush", function(){
                    updateDatapoints();
					redoTagList();
					renderAll();
                })
				.on("brushend", function(){
                    updateDatapoints();
					redoTagList();
					renderAll();
                });
			});


		// Render the initial list of datapoints
		var list = d3.selectAll("#datapoint-list").data([datapointlist]);

		// Renders the specified chart or list.
		function render(method) {
			d3.select(this).call(method);
		}

		function renderAll() {
			list.each(render);
			listtag.each(render);
			chart.each(render);
			d3.select("#active").text((all.value()));
		}

		window.filter = function(tagname) {
			byTags.filterFunction(function (tag) {
				if (tag!==null && typeof(tag)!='undefined'){
					for(i=0; i<tag.length; i++) {
						if (tag[i].title==tagname){
							return true;
						}
					}
				}
				return false;
			});
			d3.select("#activefilter").text(tagname);
			//redoTagList();
			renderAll();
			updateDatapoints();
			tagsFiltered = true;
		};
		//executed when someone click on a bubble on the map
		window.filterLocation = function(location) {
			var locationname;
			byFullLocation.filterFunction(function (datapointlocation) {
				var newlocation = location;
				var locationarray=newlocation.split(',');
				if (datapointlocation.latitude==locationarray[0] && datapointlocation.longitude==locationarray[1]){
					locationname=datapointlocation.title;
					return true;
				}
				return false;
			});
			updateDatapoints();
			redoTagList();
			renderAll();
			d3.select("#activelocation").text(locationname);
			if (tagsFiltered){
				d3.selectAll($(".tag")).remove();
			}
		};

		//Javascript exexcuted onchange when dropdown menu for stage is changed
		window.filterStage = function(stage){
			if (stage!==''){
				byStage.filter(stage);
			} else {
				//Remove all filters
				byStage.filterAll(null);
			}
			updateDatapoints();
			redoTagList();
			renderAll();
		};

		function redoTagList() {
			var tags=[];
			byId.top(Infinity).forEach(function(p, i) {
				if (p.tags!==null && typeof(p.tags)!='undefined'){
					p.tags.forEach(function(tag){
						tags.push({title: tag.title,total: 1});
					});
				}
			});
			crosstags = crossfilter(tags);
			tagList = crosstags.dimension(function(p){return p.title;});
		}

		window.reset = function() {
			byTags.filterAll(null);
			byFullLocation.filterAll(null);
			byStage.filterAll(null);
			charts[0].filter(null);
			$("#stagedropdown").val('');
			redoTagList();
			renderAll();
			updateDatapoints();
			d3.select("#activefilter").text('');
			d3.select("#activelocation").text('');
			tagsFiltered = false;
		};

		window.resetDates = function(i) {
			charts[i].filter(null);
			renderAll();
		};
		iranjson();
		renderAll();



		window.showModal = function (datapointId){
			var dateformat = d3.time.format("%B %d, %Y");
			byId.filter(datapointId);
			byId.top(Infinity).forEach(function(p, i) {
				d3.select("#datapointevent").text(p.title);
				d3.select("#datapointdescription").text(p.description);
				d3.select("#datapointstage").text(p.stage);
				d3.select("#datapointlocation").text(p.Location.title);
				d3.select("#datapointdate").text(dateformat(p.event_date));
				d3.select("#datapointlink").attr("href",function(d) { return "/datapoint/edit?id="+p._id; });
				d3.selectAll(".datapointsource").remove();
				if (p.sources!==null && typeof(p.sources)!='undefined'){
					for (var j=0;j<p.sources.length;j++){
						//Create link if it's a URL in the source field
						if (/^(f|ht)tps?:\/\//i.test(p.sources[j].url)){
							datapointsource = d3.select("#datapointsources").
							append("span").text(p.sources[j].sourcetype+" : ").attr("class","datapointsource").append("a").attr("href",p.sources[j].url).text(p.sources[j].url).attr("target","_blank").attr("class","datapointsource");
						} else {
							datapointsource = d3.select("#datapointsources").
							append("span").attr("class","datapointsource").text(p.sources[j].sourcetype+" : "+p.sources[j].url);
						}
					}
				}
			});
			byId.filterAll(null);
			$('#myModal').modal('toggle');
		};

		// The table at the bottom of the page
		function datapointlist(div) {
			div.each(function() {
				var datapoints = d3.select(this).selectAll(".datapoint").data(byEventDate.top(Infinity),function(d) { return d._id; });

				var datapointsEnter = datapoints.enter().append("div").attr("class","datapoint");
				var dateformat = d3.time.format("%B %d, %Y");

				datapointsEnter.append("div")
					.attr("class", "serialnumber")
					.text(function(d) { return d.serialNumber; });

				datapointsEnter.append("div")
					.attr("class", "title")
					.append("a")
					//.attr("href",function(d) { return "/datapoint/edit?id="+d._id; })
//					.attr("target","_blank")
					.attr("href","#")
					.attr("onclick",function(d) { return ("javascript:showModal('"+d._id+"'	);return false;"); })
					.text(function(d) { return d.title; });

				datapointsEnter.append("div")
					.attr("class", "stage")
					.text(function(d) { return d.stage; });

				datapointsEnter.append("div")
					.attr("class", "date")
					.text(function(d) { return dateformat(d.event_date); });

				datapoints.exit().remove();

				datapoints.order();
			});
		}
		//create list of tags (being displayed on the left side of the screen)
		function taglist(div) {
			div.each(function() {
				//d3.selectAll(this.childNodes).remove();
				var tags = d3.select(this).selectAll(".tag").data(tagList.group().top(Infinity),function(d) { return d.key+d.value; });
				var tagsEnter = tags.enter().append("div").attr("class","tag");
				tagsEnter.append("a")
					.attr("class", "title")
					//TODO not have javascript directly in the link
					.attr("href","#")
					.attr("onclick",function(d) { return ("javascript:filter('"+d.key+"');return false;"); })
					.text(function(d) { return d.key+" ("+d.value+")"; });
				tags.exit().remove();
				tags.order();
			});
		}

		function barChart() {
			if (!barChart.id) barChart.id = 0;

			var margin = {top: 10, right: 10, bottom: 20, left: 10},
				x,
				y = d3.scale.linear().range([100, 0]),
				id = barChart.id++,
				axis = d3.svg.axis().orient("bottom"),
				brush = d3.svg.brush(),
				brushDirty,
				dimension,
				group,
				round;

			function chart(div) {
			  var width = x.range()[1],
				  height = y.range()[0];

			  y.domain([0, group.top(1)[0].value]);

			  div.each(function() {
				var div = d3.select(this),
					g = div.select("g");

				// Create the skeletal chart.
				if (g.empty()) {
				 /* div.select(".title").append("a")
					  .attr("href", "javascript:resetDates(" + id + ")")
					  .attr("class", "reset")
					  .text("reset")
					  .style("display", "none");*/

				  g = div.append("svg")
					  .attr("width", width + margin.left + margin.right)
					  .attr("height", height + margin.top + margin.bottom )
					.append("g")
					  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				  g.append("clipPath")
					  .attr("id", "clip-" + id)
					.append("rect")
					  .attr("width", width)
					  .attr("height", height);

				  g.selectAll(".bar")
					  .data(["background", "foreground"])
					.enter().append("path")
					  .attr("class", function(d) { return d + " bar"; })
					  .datum(group.all());

				  g.selectAll(".foreground.bar")
					  .attr("clip-path", "url(#clip-" + id + ")");

				  g.append("g")
					  .attr("class", "axis")
					  .attr("transform", "translate(0," + height + ")")
					  .call(axis);

					g.append("text")
					.attr("class", "chart-label")
					  .attr("transform", "translate("+width/2+"," + (margin.top + margin.bottom) + ")")
					  .text("Click on chart to filter by dates");

				  // Initialize the brush component with pretty resize handles.
				  var gBrush = g.append("g").attr("class", "brush").call(brush);
				  gBrush.selectAll("rect").attr("height", height);
				  gBrush.selectAll(".resize").append("path").attr("d", resizePath);
				}

				// Only redraw the brush if set externally.
				if (brushDirty) {
				  brushDirty = false;
				  g.selectAll(".brush").call(brush);
				  div.select(".title a").style("display", brush.empty() ? "none" : null);
				  if (brush.empty()) {
					g.selectAll("#clip-" + id + " rect")
						.attr("x", 0)
						.attr("width", width);
				  } else {
					var extent = brush.extent();
					g.selectAll("#clip-" + id + " rect")
						.attr("x", x(extent[0]))
						.attr("width", x(extent[1]) - x(extent[0]));
				  }
				}

				g.selectAll(".bar").attr("d", barPath);
			  });

			  function barPath(groups) {
				var path = [],
					i = -1,
					n = groups.length,
					d;
				while (++i < n) {
				  d = groups[i];
				  path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
				}
				return path.join("");
			  }

			  function resizePath(d) {
				var e = +(d == "e"),
					x = e ? 1 : -1,
					y = height / 3;
				return "M" + (.5 * x) + "," + y
					+ "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
					+ "V" + (2 * y - 6)
					+ "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
					+ "Z"
					+ "M" + (2.5 * x) + "," + (y + 8)
					+ "V" + (2 * y - 8)
					+ "M" + (4.5 * x) + "," + (y + 8)
					+ "V" + (2 * y - 8);
			  }
			}

			brush.on("brushstart.chart", function() {
			  var div = d3.select(this.parentNode.parentNode.parentNode);
			  div.select(".title a").style("display", null);
			});

			brush.on("brush.chart", function() {
			  var g = d3.select(this.parentNode),
				  extent = brush.extent();
			  if (round) g.select(".brush")
				  .call(brush.extent(extent = extent.map(round)))
				.selectAll(".resize")
				  .style("display", null);
			  g.select("#clip-" + id + " rect")
				  .attr("x", x(extent[0]))
				  .attr("width", x(extent[1]) - x(extent[0]));
			  dimension.filterRange(extent);
			});

			brush.on("brushend.chart", function() {
			  if (brush.empty()) {
				var div = d3.select(this.parentNode.parentNode.parentNode);
				div.select(".title a").style("display", "none");
				div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
				dimension.filterAll();
			  }
			});

			chart.margin = function(_) {
			  if (!arguments.length) return margin;
			  margin = _;
			  return chart;
			};

			chart.x = function(_) {
			  if (!arguments.length) return x;
			  x = _;
			  axis.scale(x);
			  brush.x(x);
			  return chart;
			};

			chart.y = function(_) {
			  if (!arguments.length) return y;
			  y = _;
			  return chart;
			};

			chart.dimension = function(_) {
			  if (!arguments.length) return dimension;
			  dimension = _;
			  return chart;
			};

			chart.filter = function(_) {
			  if (_) {
				brush.extent(_);
				dimension.filterRange(_);
			  } else {
				brush.clear();
				dimension.filterAll();
			  }
			  brushDirty = true;
			  return chart;
			};

			chart.group = function(_) {
			  if (!arguments.length) return group;
			  group = _;
			  return chart;
			};

			chart.round = function(_) {
			  if (!arguments.length) return round;
			  round = _;
			  return chart;
			};

			return d3.rebind(chart, brush, "on");
		  }


	});
});