var url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

var margin = {
    top: 50,
    right: 60,
    bottom: 50,
    left: 70,
  },
  w = 920 - margin.left - margin.right,
  h = 630 - margin.top - margin.bottom;

var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", w + margin.left + margin.right)
  .attr("height", h + margin.top + margin.bottom)
  .append("g")
  // Use g element to group content of svg together in order to transform all content at once
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3
  .select("#chart")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

const legendData = [
  {
    text: "Riders with doping allegations",
    color: "#e84118",
  },
  {
    text: "Riders without doping allegations",
    color: "#8c7ae6",
  },
];

d3.json(url).then(function (data) {
  data.forEach(function (d) {
    var parsedTime = d.Time.split(":");
    d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });

  var xScale = d3
    .scaleLinear()
    .range([0, w])
    .domain([d3.min(data, (d) => d.Year) - 1, d3.max(data, (d) => d.Year) + 1]);

  var yScale = d3
    .scaleTime()
    .range([0, h])
    .domain(d3.extent(data, (d) => d.Time));

  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

  svg
    .append("g")
    .call(xAxis)
    .attr("transform", "translate(0," + h + ")")
    .attr("id", "x-axis");

  svg.append("g").call(yAxis).attr("id", "y-axis");

  svg
    .append("text")
    .attr("x", w - 40)
    .attr("y", h + margin.bottom - 20)
    .text("Year");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -150)
    .attr("y", -45)
    .text("Time [minutes]");

  var formatTime = d3.timeFormat("%M:%S");

  // Generate contents of tooltip
  var tooltipGen = function (d) {
    var doping = d.Doping == "" ? "No doping allegations" : d.Doping;

    return (
      "Name: " +
      "<b>" +
      d.Name +
      "</b>" +
      " | " +
      d.Nationality +
      "<br>" +
      "Year: " +
      d.Year +
      " | " +
      "Time: " +
      formatTime(d.Time) +
      "<br>" +
      "Place: " +
      d.Place +
      "<br>" +
      "<hr>" +
      doping
    );
  };

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.Time))
    .attr("r", (d) => 8)
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toISOString())
    .style("fill", (d) => (d.Doping == "" ? "#8c7ae6" : "#e84118"))
    .on("mouseover", (d) => {
      tooltip
        .attr("data-year", d.Year)
        .html(tooltipGen(d))
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .style("opacity", 0.9)
        .transition()
        .duration(300);
    })
    .on("mouseout", (d) => {
      tooltip.style("opacity", 0).transition().duration(300);
    });

  // Create legend using legendData array defined earlier
  var legend = d3
    .select("svg")
    .append("g")
    .attr("id", "legend")
    .selectAll("g")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item");

  // Add circles to legend
  legend
    .append("circle")
    .attr("class", "legend-item-dot")
    .attr("cx", w - 100)
    .attr("cy", (d, i) => 300 + i * 30)
    .attr("r", 8)
    .style("fill", (d) => d.color);

  // Add text to legend
  legend
    .append("text")
    .attr("class", "legend-item-text")
    .attr("dominant-baseline", "central")
    .text((d) => d.text)
    .attr("x", w - 80)
    .attr("y", (d, i) => 300 + i * 30);

  // Add legend border
  svg
    .append("rect")
    .attr("id", "legend-border")
    .attr("x", w - 200)
    .attr("y", 235)
    .attr("width", 250)
    .attr("height", 60)
    .attr("rx", 3)
    .attr("ry", 3);
});
