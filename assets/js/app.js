function makeResponsive(){

var svgArea = d3.select("body").select("svg")

if (!svgArea.empty()) {
  svgArea.remove();
}
var containerWidth = +d3.select('#plot_container').style('width').slice(0, -2)
console.log(containerWidth)

var svgWidth = containerWidth;
var svgHeight = containerWidth*(500/950);
var margin = {
  top: svgHeight*0.1,
  right: svgWidth*0.10,
  bottom: svgHeight*0.25,
  left: svgWidth*0.15
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
  
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("assets/data/data.csv").then(function(data){
    
    console.log(data);

    // parse data
    data.forEach(function(d){
        for (var key in d) {
            if(key !== "abbr" && key !== "state"){
                d[key] = +d[key];
          }}
    })

    //scalar functions
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.income))
        .range([0, width]);
    var yLinearScale = d3.scaleLinear()
        .domain([0,d3.max(data, d => d.healthcare)])
        .range([height, 0]);

    // axes
    var xAxis = d3.axisBottom(xLinearScale).ticks(6);
    var yAxis = d3.axisLeft(yLinearScale).ticks(6);

    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

    chartGroup.append("g")
    .call(yAxis);

    //data points
    var radius = 10;
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.income))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", radius )
    .classed("stateCircle", "true");

    // state labels
    chartGroup
    .selectAll("div")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d.income))
    .attr("y", d => yLinearScale(d.healthcare)+3)
    .text(d => d.abbr)
    .classed("stateText", "true")
    .style("font-size", `${radius}px`)

    // tool tip
    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([10, 30])
    .html(function(d) {
      return (`<strong>${d.state}</strong><br> 
      Median Income: ${d.income} <br> 
      Access to healthcare: ${d.healthcare} <br> `);
    });

    // add tooltip in the chart
    chartGroup.call(toolTip);

    // event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d, this);
    })
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });
    
    // x axis label
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .style("text-anchor", "middle")
    .text("Health Care");
    
    // y axis label
    chartGroup.append("text")
    .attr("transform", `translate(${width/2}, ${height+40})`)
    .attr("class", "axisText")
    .style("text-anchor", "middle")
    .text("Income");

}).catch(function(error) {
    console.log(error);
  });
}

makeResponsive()

d3.select(window).on("resize", makeResponsive);
