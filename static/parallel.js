function pcp(){

var margin = {top: 50, right: 50, bottom: 50, left: 80},
			width = 1400 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

	fetch('/pcp')
        .then(function(response){
        return response.json()
        }).then(function(data)  {


				var dimensions = [

				{
					name: "Nationality",
					scale: d3.scaleBand().range([0, height]),
					type: "string"
				},

				{
					name: "Club",
					scale: d3.scaleBand().range([0, height]),
					type: "string"
				},

				{
					name: "Value",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},

				{
					name: "Wages",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},
				{
					name: "Weight",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},

				{
					name: "Heading",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},
				{
					name: "ShortPassing",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},
				{
					name: "Dribbling",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},
				{
					name: "Stamina",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},
				{
					name: "Strength",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				},
				{
					name: "Penalties",
					scale: d3.scaleLinear().range([height, 0]),
    				type: "number"
				}

			];
var color = d3.scaleOrdinal()
  .range(["#5298af","#D58323","#bd1a9a","#54AF52","#8C92E8","#E15E5A","#725D82","#776327","#50AB84","#954D56","#AB9C27","#517C3F","#9D5130","#357468","#5E9ACF","#C47DCB","#7D9E33","#DB7F85","#BA89AD","#4C6C86","#B59248","#D8597D","#944F7E","#D67D4B","#8F86C2"]);


			var x = d3.scaleBand().domain(dimensions.map(function(d) { return d.name; })).range([0, width]),
	    		y = {},
	    		dragging = {};

            for(i in dimensions){
          var name=dimensions[i].name
          y[name]=d3.scaleLinear()
          .domain(d3.extent(data,function(d){ return +d[name]; }))
          .range([height,0])
        }

			var line = d3.line(),
				axis = d3.axisBottom(x).tickFormat(function(d){ return d.x;}),
				background,
				foreground;


			var svg = d3.select("#svg6").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


				//Create the dimensions depending on attribute "type" (number|string)
				//The x-scale calculates the position by attribute dimensions[x].name
				dimensions.forEach(function(dimensions) {
					dimensions.scale.domain(dimensions.type === "number"
						? d3.extent(data, function(d) { return +d[dimensions.name]; })
						: data.map(function(d) { return d[dimensions.name]; }).sort());
				});

				// Add grey background lines for context.
				background = svg.append("g")
						.attr("class", "background")
					.selectAll("path")
						.data(data)
					.enter().append("path")
						.attr("d", path);

				// Add blue foreground lines for focus.
				foreground = svg.append("g")
						.attr("class", "foreground")
					.selectAll("path")
						.data(data)
					.enter().append("path")
					.attr("class", function (d) { return "line " + d.c } )
					.attr("d", path)
					.style("stroke", function(d){ return( color(d.c))} )
					.style("stroke-width",1)
                    .style("opacity", 0.3);

				// Add a group element for each dimension.
				var g = svg.selectAll(".dimensions")
							.data(dimensions)
						.enter().append("g")
							.attr("class", "dimensions")
							.attr("transform", function(d) { return "translate(" + x(d.name) + ")"; })
						.call(d3.drag()
								.subject(function(d) { return {x: x(d.name)}; })
							.on("start", function(d) {
								dragging[d.name] = x(d.name);
								//background.attr("visibility", "hidden");
							})
							.on("drag", function(d) {
								dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
								foreground.attr("d", path);
								dimensions.sort(function(a, b) { return position(a) - position(b); });
								x.domain(dimensions.map(function(d) { return d.name; }));
								g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
							})
							.on("end", function(d) {
								delete dragging[d.name];
								transition(d3.select(this)).attr("transform", "translate(" + x(d.name) + ")");
								transition(foreground).attr("d", path);
								background
									.attr("d", path)
									.transition()
										.delay(500)
										.duration(0)
										.attr("visibility", null);
							})
						);

				// Add an axis and title.
				g.append("g")
						.attr("class", "axis")
					.each( function(d) { d3.select(this).call(d3.axisLeft(d.scale)); })
						.append("text")
							.style("text-anchor", "middle")
							.attr("class", "axis-label")
							.attr("y", -16)
							.text(function(d) { return d.name; })
							.style("fill", "black");





						// Add and store a brush for each axis.
                    // Add and store a brush for each axis.
      g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        //console.log(d)
        d3.select(this).call(
          y[d.name].brush= d3.brushY()
          .extent([[-10,0], [10,height]])
          .on("start", brushstart)
          .on("brush", brush)
          .on("end", brush)
        )
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);



			function position(d) {
				var v = dragging[d.name];
				return v == null ? x(d.name) : v;
			}

			function transition(g) {
				return g.transition().duration(500);
			}

			// Returns the path for a given data point.
			function path(d) {
				//return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
				return line(dimensions.map(function(dimensions) {
					var v = dragging[dimensions.name];
					var tx = v == null ? x(dimensions.name) : v;
					return [tx, dimensions.scale(d[dimensions.name])];
				}));
			}

			function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }
    // Handles a brush event, toggling the display of foreground lines.
    function brushstart() {
				d3.event.sourceEvent.stopPropagation();
			}

			// Handles a brush event, toggling the display of foreground lines.
			function brush() {
				var actives=[];
        svg.selectAll(".brush")
        .filter(function(d){
            return d3.brushSelection(this);
        })
        .each(function(key){
          //console.log(key);
            actives.push({
              dimension: key.name,
              extent: d3.brushSelection(this)
            });
          });
          if(actives.length===0){
            foreground.style("display",null);
          }
          else{
            foreground.style("display",function(d){
              return actives.every(function(brushObj){
                return brushObj.extent[0]<=y[brushObj.dimension](d[brushObj.dimension]) && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
              }) ? null : "none";
            });
          }

			}


});

  }
