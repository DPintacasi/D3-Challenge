

function makeResponsive(){
  // check if there is already a chart
  var svgArea = d3.select("body").select("svg")

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // get container size for responsive chart dimensions
  var containerWidth = +d3.select('#plot_container').style('width').slice(0, -2)
  console.log(containerWidth)

  var svgWidth = containerWidth;
  var svgHeight = containerWidth;
  var margin = {
    top: svgHeight*0.1,
    right: svgWidth*0.10,
    bottom: svgHeight*0.25,
    left: svgWidth*0.20
  };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // initialise the SVG
  var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  //initialise chartgroup to easily apply transformation  
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // x axis label/options
  const xoptions = ["Median Income ($)", "Median Age", "In Poverty (%)"]
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

  // y axis label/options
  const yoptions = ["Lacks Healthcare (%)", "Obese (%)", "Smokes (%)"]
  chartGroup
  .selectAll("div")
  .data(yoptions)
  .enter()
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", (d, i) => 0-55+i*15)
  .attr("x", 0 - (height / 2))
  .classed("aText", "true")
  .classed("inactive", "true")
  .classed("yOptions", "true")
  .text(d => d);

  // default selected labels
  // removes "inactive" class and adds "active"
  d3.selectAll(".aText")
  .filter(function(){ 
    return d3.select(this).text() === "Lacks Healthcare (%)" || d3.select(this).text() === "Median Income ($)"
  })
  .classed("inactive", false) 
  .classed("active", true);

  // promise holds data
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

    /***** ***** ***** ***** ***** ***** ***** ***** */
    // initial chart
    function initChart(){
      
      //get extents of data set (so we can add padding to axes)
      var xExtent = d3.extent(data, d => d.income);
      var yExtent = d3.extent(data, d => d.healthcare);

      var xRange = xExtent[1]-xExtent[0];
      var yRange = yExtent[1]-yExtent[0];

      // padding as a percentage of the range
      const padP = 0.1
      
      //linear scales
      var xLinearScale = d3.scaleLinear()
      .domain([xExtent[0]-xRange*padP,xExtent[1]+xRange*padP])
      .range([0, width]);

      var yLinearScale = d3.scaleLinear()
      .domain([yExtent[0]-yRange*padP,yExtent[1]+yRange*padP])
      .range([height, 0]);

      // axes
      var xAxis = d3.axisBottom(xLinearScale).ticks(6);
      var yAxis = d3.axisLeft(yLinearScale).ticks(6);

      chartGroup.append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

      chartGroup.append("g")
      .attr("id", "yAxis")
      .call(yAxis);

      //data points 
      const radius = 8;
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

    //run initial chart

    initChart()
    
    /***** ***** ***** ***** ***** ***** ***** ***** */
    // click event for choosing an axes
    d3.selectAll(".aText").on("click", function(){

      var selection = d3.select(this);

      // all options are set as inactive 
      // conditional on whether the selection was an x or y option
      // so that the other axis is not affected
      if (selection.classed("xOptions")){
        d3.selectAll(".xOptions").classed("inactive", true).classed("active",false);
      }
      else{
        d3.selectAll(".yOptions").classed("inactive", true).classed("active",false);
      };

      // selection if set to "active"
      selection.classed("inactive", false).classed("active", true);

      newChart()
    });
    
    /***** ***** ***** ***** ***** ***** ***** ***** */
    // function that animates the chart with new selected data

    function newChart(){

      // data/key is recongised via the "active" class
      var xSelection = d3.selectAll(".active").filter(function(){ 
        return d3.select(this).classed("xOptions")});
      var ySelection = d3.selectAll(".active").filter(function(){ 
        return d3.select(this).classed("yOptions")});
      
      console.log(xSelection.text())
      console.log(ySelection.text())

      // axis label is converted to name of the key
      const labels = {
        "Median Income ($)" : "income",
        "Median Age" : "age",
        "In Poverty (%)" : "poverty",
        "Lacks Healthcare (%)" : "healthcare",
        "Obese (%)" : "obesity",
        "Smokes (%)" : "smokes"
      };

      var xKey = labels[xSelection.text()];
      var yKey = labels[ySelection.text()];

      // once key is identified, data array is extracted
      var xArray = data.map((d)=>d[xKey]);
      var yArray = data.map((d)=>d[yKey]);

      // axis creationg similar to initchart
      var xExtent = d3.extent(xArray);
      var yExtent = d3.extent(yArray);

      var xRange = xExtent[1]-xExtent[0];
      var yRange = yExtent[1]-yExtent[0];

      const padP = 0.1
      
      var xLinearScale = d3.scaleLinear()
      .domain([xExtent[0]-xRange*padP,xExtent[1]+xRange*padP])
      .range([0, width]);

      var yLinearScale = d3.scaleLinear()
      .domain([yExtent[0]-yRange*padP,yExtent[1]+yRange*padP])
      .range([height, 0]);

      var xAxis = d3.axisBottom(xLinearScale).ticks(6);
      var yAxis = d3.axisLeft(yLinearScale).ticks(6);

      // animate axis change
      chartGroup.select("#xAxis")
      .transition()
      .duration(1000)
      .call(xAxis);

      chartGroup.select("#yAxis")
      .transition()
      .duration(1000)
      .call(yAxis);

      // animate markers and labels based on new data array
      chartGroup.selectAll("circle")
      .transition()
      .duration(1000)
      .attr("cx", (d, i) => xLinearScale(xArray[i]))
      .attr("cy", (d, i) => yLinearScale(yArray[i]));

      chartGroup.selectAll(".stateText")
      .transition()
      .duration(1000)
      .attr("x", (d, i) => xLinearScale(xArray[i]))
      .attr("y", (d, i) => yLinearScale(yArray[i])+3);

      // update tooltip
      var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([10, 30])
      .html(function(d) {
        return (`<strong>${d.state}</strong> <br>
                ${xSelection.text()}: ${d[xKey]} <br>
                ${ySelection.text()}: ${d[yKey]}`);
      });

      chartGroup.call(toolTip);

      chartGroup.selectAll("circle").on("mouseover", function(d) {
        toolTip.show(d, this);
      });

      chartGroup.selectAll("circle").on("mouseout", function(d) {
        toolTip.hide(d);
      });

    };
    
  }).catch(function(error) {
    console.log(error);
  });

};

makeResponsive(true)
d3.select(window).on("resize", makeResponsive);