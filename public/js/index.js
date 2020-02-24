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
var lineWidth = 4;

function color(type){
  switch(type) {
    case "temperature":
      return '#bf0000';
    case "humidity":
      return '#0300bf';
    case "soilMoisture":
      return '#b80099';
    case "light":
      return '#00960a';
    default:
      return 'black';
  }
}

function formatData(type, data){
  data.forEach(function(d,i){
    d.created = new Date(d.created).getTime();

    switch(type) {
      case "temperature":
        d.desired = d.temperature;
        break;
      case "humidity":
        d.desired = d.humidity;
        break;
      case "soilMoisture":
        d.desired = d.soilMoisture;
        break;
      case "light":
        d.desired = d.light;
        break;
      default:
        d.desired = -1;
    }
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
                        .tickFormat(d3.timeFormat('%m/%d - %H')));

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
              .attr('stroke-width', lineWidth)
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
                  .tickFormat(d3.timeFormat('%m/%d - %H')));

    yAxis
      .call(d3.axisLeft(yScale)
                  .tickSize(-width + 2*padding)
                  .tickSizeOuter(0));


    line
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color(type))
      .attr('stroke-width', lineWidth)
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
  setInterval(updateChart, 30 * 1000);
});
