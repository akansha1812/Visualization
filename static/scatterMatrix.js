function createScatterMatrix(data){
d3.selectAll("#svg3 > *").remove();
var svg = d3.select("#svg3").text("Scatter Matrix"),
 width = 960,
    size = 230,
    padding = 20;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);

var color = d3.scaleOrdinal(d3.schemeCategory10);


  var domainByTrait = {},
      features = d3.keys(data[0]).filter(function(d) { return d !== "c"; }),
      n = features.length;

  features.forEach(function(feature) {
    domainByTrait[feature] = d3.extent(data, function(d) { console.log(d[feature]); return d[feature]; });
  });
    yAxis.tickSize(-size * n);
    xAxis.tickSize(size * n);


  var brush = d3.brush()
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend)
      .extent([[0,0],[size,size]]);

  svg.append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")")
      .text("Scatter Matrix");

  svg.selectAll(".x.axis")
      .data(features)
    .enter().append("g")
      .attr("class", "x axis1")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(features)
    .enter().append("g")
      .attr("class", "y axis1")
      .attr("transform", function(d, i) { return "translate(15," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(diagonal(features, features))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".60em")
      .attr("dx", ".75em")
      .text(function(d) { console.log(d); return d.x; });

  cell.call(brush);

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.c); });
  }

  var brushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.move, null);
      brushCell = this;
    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var er = d3.brushSelection(this);
    svg.selectAll("circle").classed("hidden", function(d) {
      return !er
        ? false
        : (
          er[0][0] > x(+d[p.x]) || x(+d[p.x]) > err[1][0]
          || err[0][1] > y(+d[p.y]) || y(+d[p.y]) > err[1][1]
        );
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    var err = d3.brushSelection(this);
    if (err === null) svg.selectAll(".hidden").classed("hidden", false);
  }


}
function diagonal(r, c) {
  var d = [], nr = r.length, nc = c.length, i, j;
  for (i = -1; ++i < nr;) for (j = -1; ++j < nc;) d.push({x: r[i], i: i, y: c[j], j: j});
  return d;
}
