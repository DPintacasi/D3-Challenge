var svgArea = d3.select("body").select("svg")

if (!svgArea.empty()) {
  svgArea.remove();
}

var containerWidth = +d3.select('#plot_container').style('width').slice(0, -2)
console.log(containerWidth)

var svgWidth = containerWidth;
var svgHeight = containerWidth;
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

// x axis label/options
const xoptions = ["income", "age", "poverty"]
chartGroup
.selectAll("div")
.data(xoptions)
.enter()
.append("text")
.attr("x", width/2)
.attr("y", (d, i) => height+40+i*15)
.classed("aText", "true")
.classed("inactive", "true")
.classed("xOptions", "true")
.text(d => d);

// y axis label
const yoptions = ["healthcare", "obesity", "smokes"]
chartGroup
.selectAll("div")
.data(yoptions)
.enter()
.append("text")
.attr("transform", "rotate(-90)")
.attr("y", (d, i) => 0-margin.left+40+i*15)
.attr("x", 0 - (height / 2))
.classed("aText", "true")
.classed("inactive", "true")
.classed("yOptions", "true")
.text(d => d);

// default labels
d3.selectAll(".aText")
.filter(function(){ 
  return d3.select(this).text() === "healthcare" || d3.select(this).text() === "income"
})
.classed("inactive", false)
.classed("active", true);

// Event Listener and Handler for Axis Chooser

d3.csv("assets/data/data.csv").then(function(data){
    
  console.log(data);

  // parse data
  data.forEach(function(d){
    for (var key in d) {
      if(key !== "abbr" && key !== "state"){
        d[key] = +d[key];
      };
    };
  });

  function init_chart(){
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
  .style("font-size", `${radius}px`);

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
  });

  circlesGroup.on("mouseout", function(d) {
    toolTip.hide(d);
  });

  };

  init_chart()

  // click event for choosing an axes
  d3.selectAll(".aText").on("click", function(){
    // console.log(this);
    var selection = d3.select(this);
    if (selection.classed("xOptions")){
      d3.selectAll(".xOptions").classed("inactive", true);
      newX(selection)
    }
    else{
      d3.selectAll(".yOptions").classed("inactive", true);
      newY(selection)
    };
    selection.classed("inactive", false).classed("active", "true");
  });

  function newX(selection){

    console.log(`Variable selection: ${selection.text()}`);
    console.log("It is on the X axis");

    array = data.map((d)=> d[selection.text()])
    console.log(array)

    var scale = d3.scaleLinear()
    .domain(d3.extent(array))
    .range([0, width]);

    console.log(chartGroup.selectAll("circle"))
    chartGroup.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", (d, i) => scale(array[i]))

    chartGroup.selectAll(".stateText")
    .transition()
    .duration(1000)
    .attr("x", (d, i) => scale(array[i]))

    

  };

  function newY(selection){
    console.log(`Variable selection: ${selection.text()}`);
    console.log("It is on the Y axis");

    array = data.map((d)=> d[selection.text()])
    console.log(array)

    var scale = d3.scaleLinear()
    .domain(d3.extent(array))
    .range([height, 0]);

    console.log(chartGroup.selectAll("circle"))
    chartGroup.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cy", (d, i) => scale(array[i]))

    chartGroup.selectAll(".stateText")
    .transition()
    .duration(1000)
    .attr("y", (d, i) => scale(array[i]))

  };

}).catch(function(error) {
  console.log(error);
});