$(document).ready(function() {
	var host = "http://threatwiki.thesentinelproject.org";
	//var host = "http://localhost:3000";
	jQuery.getJSON(host+"/api/datapoint/soc/Iran,%20Islamic%20Republic%20of?callback=?", function(datapoints) {
		////////////////////////////////////////
		/// Crossfilter Initial configuration///
		////////////////////////////////////////
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
		var dateformat = d3.time.format("%B %d, %Y");

		var crossdatapoints = crossfilter(datapoints);
		var all = crossdatapoints.groupAll();
		var byId = crossdatapoints.dimension(function(p) { return p._id; });

		var byStage = crossdatapoints.dimension(function(p) { return p.stage; });

		var byCreator = crossdatapoints.dimension(function(p) { return p.createdBy.name; });

		var bySoc = crossdatapoints.dimension(function(p) { return p.soc; });

		var byTags = crossdatapoints.dimension(function(p){return p.tags;});

		var crosstags = crossfilter(tags);


		var tagList = crosstags.dimension(function(p){return p.title;});

		var byLocation = crossdatapoints.dimension(function(p) {
			//if (p.Location.title!='Iran'){
				return [p.Location.latitude,p.Location.longitude];
			//}
		});
		var byFullLocation = crossdatapoints.dimension(function(p) {return p.Location; });
		var byFullLocationtemp = crossdatapoints.dimension(function(p) {return p.Location; });

		var tagsFiltered = false;
		var byEventDate = crossdatapoints.dimension(function(p) { return d3.time.day(p.event_date); });
		//byEventDate.group().top(Infinity).forEach(function(p, i) {
		//	console.log(p.key + ": " + p.value);
		//});

		// Render the initial list of tag.
		var listtag = d3.select("#tag-list").data([taglist]);

		// Render the total number of datapoints
		d3.selectAll("#total").text(crossdatapoints.groupAll().reduceCount().value());


		////////////////////////////////////////
		/// Leaflet and Mapping //
		////////////////////////////////////////
		//create leaflet map
		var map = new L.Map("map", {
			center: [32, 53],
			zoom: 5,
			keyboard: false,
			minZoom: 4
		})
		.addLayer(new L.TileLayer("http://{s}.tile.cloudmade.com/aa22c4af8c674048a68c8d6f3b5d1937/998/256/{z}/{x}/{y}.png"));

		var info = L.control();

		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
			this.update();
			return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		info.update = function (location,numberdatapoints) {
			this._div.innerHTML = '<h4>Datapoints</h4>' +  (location ?
				numberdatapoints+ ' in <b>' + location + '</b>'
			: 'Iran');
		};

		info.addTo(map);
		//necessary to integrate between d3 and leaflet
		function project(x) {
			var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
			return [point.x, point.y];
		}
		//projection to be used to convert GeoJSON to SVG
		var path = d3.geo.path().projection(project);

		var svg = d3.select(map.getPanes().overlayPane).append("svg")
			.data([iranjson]);
		//our map will be included inside a <g> (group) tag, it is hidden while zooming on leaflet is happening
		var gleaf = svg.append("g").attr("class", "leaflet-zoom-hide");

		//the actual map created from data
		function iranjson() {
			d3.json("/mapfiles/iran.json", function(error, data) {
				var feature = gleaf.selectAll(".subunit")
					.data(topojson.feature(data, data.objects.iranprovinces).features)
					.enter().append("path")
					//class name based on name of region
					.attr("class", function(d) { return "subunit";})
					.attr("d", path)
					//random color for each region of iran
					.style("fill", function() {
						return "hsl(" + Math.random() * 360 + ",100%,50%)";
					});

				var bounds = d3.geo.bounds(topojson.feature(data, data.objects.iranprovinces));
				//we want to call reset everytime we zoom in or zoom out of the map
				map.on("viewreset", reset);
				reset();
				updateDatapoints();
				// Reposition the SVG to cover the features.
				function reset() {
					var bottomLeft = project(bounds[0]);
					var topRight = project(bounds[1]);
					svg.attr("width", topRight[0] - bottomLeft[0])
					.attr("height", bottomLeft[1] - topRight[1])
					.style("margin-left", bottomLeft[0] + "px")
					.style("margin-top", topRight[1] + "px");
					gleaf.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
					feature.attr("d", path);
					//when we zoom in a lot,  hide the color background
					if(map.getZoom()>10){
						feature.style("fill-opacity","0");
					} else {
						feature.style("fill-opacity","0.2");
					}
				}
			});

		}
		var markers = {};
		//the datapoints on the map
		function updateDatapoints() {
			//remove all markers from the map in order to be able to do a refresh
			for (var key in markers){
				map.removeLayer(markers[key]);
			}
			markers = {};
			//configure size of the points on the map nb of datapoints per location could be from 1 to 36
			var radius = d3.scale.sqrt()
				.domain([1, 36])
				.range([5, 16]);
			//for all the locations on the map
			byLocation.group().top(Infinity).filter(function(d) { return d.value; }).forEach(function(p, i) {
				//create a marker at that specific position
				var marker = L.circleMarker([p.key[0],p.key[1]]);
				marker.setRadius(radius(p.value));

				marker.on('mouseover',function (e) {
					//On mouse over, update the info overlay with the name of the location
					var locationname;
					byFullLocationtemp.filterFunction(function (datapointlocation) {
						if (datapointlocation.latitude==p.key[0] && datapointlocation.longitude==p.key[1]){
							locationname=datapointlocation.title;
							return true;
						}
						return false;
					});
					byFullLocationtemp.filterAll();
					info.update(locationname,p.value);
				});
				//On mouse out, re-update the info overlay with no value
				marker.on('mouseout',function (e) {
					info.update();
				});
				//on click, filter the location
				marker.on('click',function (e) {
					info.update();
					filterLocation(p.key);
				});
				//add the marker to the map
				marker.addTo(map);
				marker.setStyle({fillOpacity: 0.5,fillColor:'#0033ff'});
				//keep markers in a array so we can get rid of them later
				markers[[p.key[0],p.key[1]]]=marker;

			});
		}

		//configure bar chart for timeline
		var charts = [
		barChart()
			.dimension(byEventDate)
			.group(byEventDate.group())
			.x(d3.time.scale.utc()
				.domain([new Date(2011, 10,06), new Date()])
				.rangeRound([0, 960]))
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

		iranjson();
		renderAll();

		//executed when clicking on a tag name, will filter data by tag
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
		//executed when someone click on a bubble on the map, filter by location
		var filterLocation = function(location) {
			var locationname;
			byFullLocation.filterFunction(function (datapointlocation) {
				if (datapointlocation.latitude==location[0] && datapointlocation.longitude==location[1]){
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
		//Recreate the taglist
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
		//When clicking the Reset all filters, we show all datapoints on every visualization
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

		//triggered when going over a datapoint link in datapoint list
		//will change color on the marker that represents the datapoint location
		window.overMarker = function (datapointLocation){
			markers[datapointLocation].fire('mouseover');
			markers[datapointLocation].setStyle({fillOpacity: 0.8,fillColor:'red',color:'red'});
		};

		//triggered when cursor leaves the datapoint link in datapoint list
		window.outMarker = function (datapointLocation){
			markers[datapointLocation].fire('mouseout');
			markers[datapointLocation].setStyle({fillOpacity: 0.5,fillColor:'#0033ff',color:'#0033ff'});
		};

		//window to be displayed when clicking on a datapoint in the list
		window.showModal = function (datapointId){
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

		// Creation of table with all datapoints
		function datapointlist(div) {
			div.each(function() {
				var datapoints = d3.select(this).selectAll(".datapoint").data(byEventDate.top(Infinity),function(d) { return d._id; });

				var datapointsEnter = datapoints.enter().append("div").attr("class","datapoint");

				datapointsEnter.append("div")
					.attr("class", "serialnumber")
					.text(function(d) { return d.serialNumber; });

				datapointsEnter.append("div")
					.attr("class", "title")
					.append("a")
					.attr("href","#")
					.attr("onclick",function(d) { return ("javascript:showModal('"+d._id+"'	);return false;"); })
					.attr("onmouseover",function(d) { return ("javascript:overMarker('"+[d.Location.latitude,d.Location.longitude]+"'	);"); })
					.attr("onmouseout",function(d) { return ("javascript:outMarker('"+[d.Location.latitude,d.Location.longitude]+"'	);"); })
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
		//function given in example on https://github.com/square/crossfilter
		function barChart() {
			if (!barChart.id) barChart.id = 0;

			var margin = {top: 20, right: 10, bottom: 20, left: 10},
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
				  /*div.select(".daterange")
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
					  .attr("transform", "translate("+width/2.5+",-10"  + ")")
					  .text("Click and drag on chart to filter a date range");

				  // Initialize the brush component with pretty resize handles.
				  var gBrush = g.append("g").attr("class", "brush").call(brush);
				  gBrush.selectAll("rect").attr("height", height);
				  gBrush.selectAll(".resize").append("path").attr("d", resizePath);
				}

				// Only redraw the brush if set externally.
				if (brushDirty) {
				  brushDirty = false;
				  g.selectAll(".brush").call(brush);
				  //div.select(".daterange").style("display", brush.empty() ? "none" : null);
				  div.select(".chart-label").text("Click and drag on chart to filter a date range");

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
			  //div.select(".daterange").style("display", null);
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
			  //Update the date range selected on the UI as we select a range on the chart
			  var div = d3.select(this.parentNode.parentNode.parentNode);
			  div.select(".chart-label").style("display", null)
				.text(
				  	function(){ 
				  		var datetext;
				  		if (typeof(dimension.bottom(1)[0])!='undefined' && typeof(dimension.top(1)[0])!='undefined'){
				  			datetext=dateformat(dimension.bottom(1)[0].event_date) + ' to ' + dateformat(dimension.top(1)[0].event_date);
				  		} else {
				  			datetext='Click and drag on chart to filter a date range';
				  		}
						return (datetext);
				  	}
				);

			});

			brush.on("brushend.chart", function() {
			  if (brush.empty()) {
				var div = d3.select(this.parentNode.parentNode.parentNode);
				//div.select(".daterange").style("display", "none");
				  div.select(".chart-label").text("Click and drag on chart to filter a date range");
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