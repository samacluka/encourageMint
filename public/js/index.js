var height = 600;
var width = 800;
var padding = 50;

var yScale;
var xScale;

var xAxis;
var yAxis;

var xAxisLabel;
var yAxisLabel;
var title;

var svg;
var circles;
var line;

var data;
var bisect;
var focus;
var focusText;

function color(type){
  if(type === "temperature"){
    return 'red';
  } else if(type === "humidity"){
    return 'lightblue';
  } else if(type === "soilMoisture"){
    return 'blue';
  } else if(type === "light"){
    return 'orange';
  } else{
    return -1;
  }
}

function getDesired(type, d){
  if(type === "temperature"){
    return d.temperature;
  } else if(type === "humidity"){
    return d.humidity;
  } else if(type === "soilMoisture"){
    return d.soilMoisture;
  } else if(type === "light"){
    return d.light;
  } else{
    return -1;
  }
}

function formatTime(str){ // string to epoch
  return new Date(str).getTime();
}

function formatData(type, data){
  data.forEach(function(d,i){
    d.created = formatTime(d.created);
    d.desired = getDesired(type,d)
  });
  return data;
}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// What happens when the mouse move -> show the annotations at the right positions.
function mouseover(){
  focus.style("opacity", 1)
  focusText.style("opacity",1)
}

function mousemove(){
  // recover coordinate we need
  var x0 = xScale.invert(d3.mouse(this)[0]);
  var i = bisect(data, x0, 1);
  selectedData = data[i]

  focus
    .attr("cx", xScale(selectedData.created))
    .attr("cy", yScale(selectedData.desired));

  focusText
    .html("x:" + new Date(selectedData.created).toGMTString() + "  -  " + "y:" + selectedData.desired)
    .attr("x", xScale(selectedData.created)+15)
    .attr("y", yScale(selectedData.desired));
}

function mouseout(){
  focus.style("opacity", 0)
  focusText.style("opacity", 0)
}

function initializeChart(){
  var time = $('div.time-pills span.badge-primary').data('time');
  var plantid = $("select#plant-select option:selected").val();
  var type = $('div.type-pills span.badge-primary').data('type');

  d3.json(`/log/data/${plantid}/${time}`, function(Data){
    data = formatData(type, Data);

    yScale = d3.scaleLinear()
                 .domain(d3.extent(data, d => d.desired))
                 .range([height - padding, padding]);

    xScale = d3.scaleTime()
                .domain(d3.extent(data, d => d.created))
                .range([padding, width - padding]);

    svg = d3.select('svg')
              .attr('width', width)
              .attr('height', height);

    xAxis = svg
            .append('g')
            .classed('axis xAxis', true)
            .attr('transform', `translate(0, ${height - padding})`)
            .call(d3.axisBottom(xScale)
                        .tickSize(-height + 2*padding)
                        .tickSizeOuter(0)
                        .tickFormat(d3.timeFormat('%m/%d')));

    yAxis = svg
            .append('g')
            .classed('axis yAxis', true)
            .attr('transform', `translate(${padding}, 0)`)
            .call(d3.axisLeft(yScale)
                        .tickSize(-width + 2*padding)
                        .tickSizeOuter(0));

    bisect = d3.bisector(function(d) { return d.created; }).left;

    line = svg
            .append('path')
            .datum(data)
              .attr('fill', 'none')
              .attr('stroke', color(type))
              .attr('stroke-wdith', 4)
              .attr('d', d3.line()
                .x(function(d){ return xScale(d.created); })
                .y(function(d){ return yScale(d.desired); })
              );

    // Add points
    circles = svg
              .selectAll('circle')
              .data(data, d => d.desired)
              .enter()
              .append('circle')
                .attr('cx', d => xScale(d.created))
                .attr('cy', d => yScale(d.desired))
                .attr('r', 5)
                .attr('fill', d => color(type))
                .attr('stroke',"#fff");

    focus = svg
            .append('g')
            .append('circle')
              .style("fill", "none")
              .attr("stroke", "black")
              .attr('r', 8.5)
              .style("opacity", 0);

      // Create the text that travels along the curve of chart
      focusText = svg
                  .append('g')
                  .append('text')
                    .style("opacity", 0)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle");

      // Create a rect on top of the svg area: this rectangle recovers mouse position
      svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


    // Set X axis label
    xAxisLabel = svg
                  .append('text')
                    .attr('x', width / 2)
                    .attr('y', height - padding)
                    .attr('dy', '2em')
                    .style('text-anchor','middle')
                    .text('X Label');

    // Set Y axis label
    yAxisLabel = svg
                  .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -height / 2)
                    .attr('y', padding)
                    .attr('dy', '-2em')
                    .style('text-anchor','middle')
                    .text('Y Label');
  });
}

function updateChart(){
  var time = $('div.time-pills span.badge-primary').data('time');
  var plantid = $("select#plant-select option:selected").val();
  var type = $('div.type-pills span.badge-primary').data('type');

  d3.json(`/log/data/${plantid}/${time}`, function(Data){
    data = formatData(type, Data);

    yScale = d3.scaleLinear()
                 .domain(d3.extent(data, d => d.desired))
                 .range([height - padding, padding]);

    xScale = d3.scaleTime()
                .domain(d3.extent(data, d => d.created))
                .range([padding, width - padding]);

    xAxis
      .call(d3.axisBottom(xScale)
                  .tickSize(-height + 2*padding)
                  .tickSizeOuter(0)
                  .tickFormat(d3.timeFormat('%m/%d')));

    yAxis
      .call(d3.axisLeft(yScale)
                  .tickSize(-width + 2*padding)
                  .tickSizeOuter(0));

    bisect = d3.bisector(function(d) { return d.created; }).left;

    circles = svg
              .selectAll('circle')
              .data(data, d => d.desired);

    circles
      .exit()
      .remove()

    // Add points
    circles
      .enter()
      .append('circle')
      .merge(circles)
        .attr('cx', d => xScale(d.created))
        .attr('cy', d => yScale(d.desired))
        .attr('r', 5)
        .attr('fill', d => color(type))
        .attr('stroke',"#fff");

    line
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color(type))
      .attr('stroke-wdith', 4)
      .attr('d', d3.line()
        .x(function(d){ return xScale(d.created); })
        .y(function(d){ return yScale(d.desired); })
      );



    // Update Title
    $("#plant-label").text(`${capitalize(type.toString())} vs. Time`); // Update label
    $.ajax({ type: "GET",
        url: `/plant/data/${$('a#navbarDropdown').data("uid")}`,
        async: true,
        success : function(plants){
          var str = "";

          plants.forEach((plant, index) => {
            if(plantid === plant._id){
              str += `<option value="${plant._id}" selected>${plant.Name}</option>`;
            } else {
              str += `<option value="${plant._id}">${plant.Name}</option>`;
            }
          });

          $('select#plant-select').html(str);
        }
      }); // Update Select
    xAxisLabel.text('X Label'); // Update X
    yAxisLabel.text('Y Label'); // Update Y
  });
}

function selectPill(event){
  $(`div.${event.data.str}-pills span.badge-primary`).addClass('badge-success');
  $(`div.${event.data.str}-pills span.badge-primary`).removeClass('badge-primary');
  $(this).removeClass('badge-success');
  $(this).addClass('badge-primary');
  updateChart();
}

$(document).ready(function(){
  $('div.type-pills span').on('click', {str: 'type'}, selectPill);
  $('div.time-pills span').on('click', {str: 'time'}, selectPill);
  $('select#plant-select').on('change', function(event){
    updateChart();
    event.stopPropagation();
  });

  initializeChart();
});
