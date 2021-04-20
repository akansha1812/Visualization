
function createScatterPlot(){


    var svg = d3.select("#svg2"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin
    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 200)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("Biplot")

    var xScale = d3.scaleLinear().range([0,width]);//scaleBand() is used to construct a band scale. This is useful when our data has discrete bands.
        yScale = d3.scaleLinear().range([height, 0]);//a linear scale for the y-axis since this axis will show our stock prices.

//   #
    var g = svg.append("g")
               .attr("transform", "translate(" + 100 + "," + 100 + ")");

    fetch('/biplot')
        .then(function(response){
        return response.json()
        }).then(function(data){


         fetch('/biplotAttr')
        .then(function(response){
        return response.json()
        }).then(function(cols){

        var offset_pc1 = d3.max(data,function(d) { return (d.PC1)}) -20;
        var offset_pc2 = d3.max(data,function(d) { return (d.PC2)}) -20;
        xScale.domain([-1,1]); //provide domain values to the x and y scales, here it's X Scale which is Timestamp
        yScale.domain([-1,1]); // domain value of Fixation Duration to y Scale
        g.append("g") //Another group element to have our x-axis grouped under one group element
         .attr("transform", "translate(0," + height + ")") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
         .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
         .append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text('PC 1');

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
         .text('PC 2');

        g.selectAll(".circle") //created dynamic bars with our data using the SVG rectangle element.
         .data(data)
         .enter().append("circle")
         .transition()                 // Keep on changing the place where transition starts and see the difference.
           .ease(d3.easeLinear)
           .duration(40)
           .delay(function (d, i) {
               return i;
           })
        // .attr("class", "bar")
         .attr("r", function(d) { return 1.5; })

         .attr("cx", function(d) { return xScale(d.PC1); })
           //x scale created earlier and pass the year value from our data.
         .attr("cy", function(d) { return yScale(d.PC2); })
         .style("fill","#5298af") // pass the data value to our y scale and receive the corresponding y value from the y range.




            console.log((cols))
            for(var j=0;j<11;j=j+1){

                 g.append("line")
                 .attr("x1",xScale(0))
                 .attr("y1",yScale(0))
                 .attr("x2",xScale(+cols[j].PC1*0.75))
                 .attr("y2",yScale(+cols[j].PC2*0.75))
                 .style("stroke","pink")
                 .style("stroke-width",2);

                 g.append("text")
                 .attr("y",yScale(+cols[j].PC2*0.75))
                 .attr("x",xScale(+cols[j].PC1*0.75))
                 .attr('text-anchor','middle')
                 .attr("class","colLable")
                 .attr("font-size","12px")
                 .text(cols[j].Attribute);
            };
        });


    });
}
