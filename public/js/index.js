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
var line;

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
    $("#title").text(`${capitalize(type.toString())} vs. Time`); // Update label
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
