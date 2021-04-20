function mds_cor(){

    console.log("create mds plot here")
    var svg = d3.select("#svg5"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin
    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 200)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("MDS - Correlation for Attributes")

 var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return d.attribute;
            })


svg.call(tip);

    var xScale = d3.scaleLinear().range([0,width]);//scaleBand() is used to construct a band scale. This is useful when our data has discrete bands.
        yScale = d3.scaleLinear().range([height, 0]);//a linear scale for the y-axis since this axis will show our stock prices.

    var g = svg.append("g")
               .attr("transform", "translate(" + 100 + "," + 100 + ")");

    fetch('/mds_cor')
        .then(function(response){
        return response.json()
        }).then(function(data) {

        data.forEach((d) => {
            d.MDS1 = +d.MDS1;
            d.MDS2 = +d.MDS2;
            d.attribute = d.attribute;

        });

        xScale.domain([d3.min(data,function(d) { return d.MDS1; }),d3.max(data,function(d) { return d.MDS1; })]); //provide domain values to the x and y scales, here it's X Scale which is Timestamp
        yScale.domain([d3.min(data, function(d) { return d.MDS2; }), d3.max(data, function(d) { return d.MDS2; })]); // domain value of Fixation Duration to y Scale

        g.append("g") //Another group element to have our x-axis grouped under one group element
         .attr("transform", "translate(0," + height + ")") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
         .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
         .append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text('MDS1');

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
         .text('MDS2');

var color = d3.scaleOrdinal(d3.schemeCategory10);

        g.selectAll(".circle") //created dynamic bars with our data using the SVG rectangle element.
         .data(data)
         .enter().append("circle")
         .attr("r", function(d) { return 5; })
         .attr("cx", function(d) { return xScale(d.MDS1); })
         .attr("cy", function(d) { return yScale(d.MDS2); })
         .style("fill", function(d) { return color(d.attribute); })
         .on('mouseover', tip.show )
                                                                 //the height of the SVG minus the corresponding y-value of the bar from the y-scale
    });
}
