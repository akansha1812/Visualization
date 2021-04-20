var n_index;
function createBarchart(){

  var svg = d3.select("#svg1"),
  margin = 200,
  width = svg.attr("width") - margin,
  height = svg.attr("height") - margin

    svg.append("text")
 .attr("transform", "translate(100,0)")
 .attr("x", 200)
 .attr("y", 50)
 .attr("font-size", "24px")
 .text("Scree Plot")


 var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                n_index = (d.PC).slice(2);

                fetch('/kmeans/'+n_index)
                        .then(function(response){return response.json()})
                        .then(function(data){createScatterMatrix(data)})
                fetch('/LoadingTable/'+n_index)
                        .then(function(response){return response.json()})
                        .then(function(data){createLoadingTable(data)})


                console.log(n_index)
                return "<strong>Cumulative Variance Ratio:</strong> <span style='color:red'>" + d.cpd + "</span>" + "<br/> Component : "+ d.PC;
            })

svg.call(tip);

var xScale = d3.scaleBand().range([0, width]).padding(0.4);//scaleBand() is used to construct a band scale. This is useful when our data has discrete bands.
  yScale = d3.scaleLinear().range([height, 0]);//a linear scale for the y-axis since this axis will show our fixation duration.

var g = svg.append("g")
         .attr("transform", "translate(" + 100 + "," + 100 + ")");

fetch('/barScree')
.then(function(response){
  return response.json()
}).then(function(data){

  console.log(data)
  xScale.domain(data.map(function(d) { return d.PC; })); //provide domain values to the x and y scales, here it's X Scale which is Timestamp
  yScale.domain([0, 1]); // domain value of Fixation Duration to y Scale

  g.append("g") //Another group element to have our x-axis grouped under one group element
   .attr("transform", "translate(0," + height + ")") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
   .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
   .append("text")
   .attr("y", height - 250)
   .attr("x", width - 100)
   .attr("text-anchor", "end")
   .attr("stroke", "black")
   .text("Components");

  g.append("g") //Another group element to have our y-axis grouped under one group element
   .call(d3.axisLeft(yScale).tickFormat(function(d){ // Try with X Scaling too.
       return  d;
   })
   .ticks(10)) //We have also specified the number of ticks we would like our y-axis to have using ticks(10).
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 6)
   .attr("dy", "-5.1em")
   .attr("text-anchor", "end")
   .attr("stroke", "black")
   .text("Explained Variance Ratio");

  g.selectAll(".bar") //created dynamic bars with our data using the SVG rectasngle element.
   .data(data)
   .enter().append("rect")
   .attr("class", "bar")
   .attr("x", function(d) { return xScale(d.PC); })  //x scale created earlier and pass the year value from our data.
   .attr("y", function(d) { return yScale(d.Variance); }) // pass the data value to our y scale and receive the corresponding y value from the y range.
   .attr("width", xScale.bandwidth()) //width of our bars would be determined by the scaleBand() function.
   .attr("height", function(d) { return height - yScale(d.Variance); }); //height of the bar would be calculated as height - yScale(d.value)
   //the height of the SVG minus the corresponding y-value of the bar from the y-scale


   var line = d3.line()
       .x(function(d) { return xScale(d.PC); }) // set the x values for the line generator
       .y(function(d) { return yScale(d.cpd); })
       .curve(d3.curveMonotoneX)  // set the y values for the line generator


   g.append("path")
       .datum(data) // 10. Binds data to the line
       .attr("class", "line") // Assign a class for styling
       .attr("d", line); // 11. Calls the line generator

   // 12. Appends a circle for each datapoint
   g.selectAll(".dot")
       .data(data)
     .enter().append("circle") // Uses the enter().append() method
       .attr("class", "dot") // Assign a class for styling
       .attr("cx", function(d, i) { return xScale(d.PC) })
       .attr("cy", function(d) { return yScale(d.cpd) })
       .attr("r", 5)
       .on('mouseover', tip.show )
       .on('mouseout', tip.hide);
       //.on('click', createLoadingTable((d.PC).slice(2)));

         fetch('/kmeans/11')
                        .then(function(response){return response.json()})
                        .then(function(data){createScatterMatrix(data)});
          fetch('/LoadingTable/11')
                        .then(function(response){return response.json()})
                        .then(function(data){createLoadingTable(data)});


});


}