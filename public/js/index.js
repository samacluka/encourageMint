// const height = $(window).height()*0.7;
// const width = $(window).width()*0.8;
// const padding = (50 / 600) * width / 1.2;

var height = 600;
var width = 1200;
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

var data;

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

function getTitle(type){
  switch(type) {
    case "temperature":
      return 'Temperature vs. Time';
    case "humidity":
      return 'Humidity vs. Time';
    case "soilMoisture":
      return 'Soil Moisture vs. Time';
    case "light":
      return 'Light vs. Time';
    default:
      return 'Data';
  }
}

function getYLabel(type){
  switch(type) {
    case "temperature":
      return 'Temperature (°C)';
    case "humidity":
      return 'Humidity (g/kg)';
    case "soilMoisture":
      return 'Soil Moisture (g/kg)';
    case "light":
      return 'Light Initensity (lm)';
    default:
      return 'Error';
  }
}

function getTimeFormat(time){
  switch(time) {
    case 1:
      return '%H:%M';
    case 2:
      return '%H:%M';
    case 12:
      return '%H:%M';
    case 24:
      return '%H:%M';
    case 72:
      return '%m/%d - %H:%M';
    case 168:
      return '%m/%d - %H';
    case 336:
      return '%m/%d';
    default:
      return 'Error';
  }
}

function formatData(type, Data){
  Data.forEach(function(d,i){
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
  return Data;
}

function setScales(time, Data){
  var now = new Date().getTime();
  var prev = now - parseInt(time) * 60 * 60 * 1000;

  yScale = d3.scaleLinear()
               .domain(d3.extent(Data, d => d.desired))
               .range([height - padding, padding]);

  xScale = d3.scaleTime()
              // .domain(d3.extent(data, d => d.created)) // Stretch available data across whole domain
              .domain([prev, now])                        // Use time scale for width
              .range([padding, width - padding]);
}

function getSelection(){
  var time = $('div.time-pills a.selected').data('time');
  var plantid = $("select#plant-select option:selected").val();
  var type = $('div.type-pills a.selected').data('type');
  return [time, plantid, type];
}

function updatePlantSelect(plantid){
  $.ajax({ type: "GET",
      url: `/data/plant/${$('a#navbarDropdown').data("uid")}/uid`,
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
    });
}

function initializeChart(){
  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  d3.json(`/data/log/${plantid}/${time}`, function(Data){
    data = formatData(type, Data);

    setScales(time, data);

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
                        .tickFormat(d3.timeFormat(getTimeFormat(time))));

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

    // Set title
    title = svg
              .append('text')
                .attr('id','title')
                .attr('x', width / 2)
                .attr('y', padding / 2)
                .style('text-anchor','middle')
                .text(getTitle(type));

    // Set X axis label
    xAxisLabel = svg
                  .append('text')
                    .attr('id','xAxisLabel')
                    .classed('axisLabel',true)
                    .attr('x', width / 2)
                    .attr('y', height - padding)
                    .attr('dy', '2.2em')
                    .style('text-anchor','middle')
                    .text('Time');

    // Set Y axis label
    yAxisLabel = svg
                  .append('text')
                    .attr('id','yAxisLabel')
                    .classed('axisLabel',true)
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -height / 2)
                    .attr('y', padding)
                    .attr('dy', '-1.5em')
                    .style('text-anchor','middle')
                    .text(getYLabel(type));
  });
}

function updateChart(){
  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  d3.json(`/data/log/${plantid}/${time}`, function(Data){
    data = formatData(type, Data);

    setScales(time, data);

    xAxis
      .transition()
      .duration(1000)
      .call(d3.axisBottom(xScale)
                  .tickSize(-height + 2*padding)
                  .tickSizeOuter(0)
                  .tickFormat(d3.timeFormat(getTimeFormat(time))));

    yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(yScale)
                  .tickSize(-width + 2*padding)
                  .tickSizeOuter(0));

    line
      .datum(data)
        .transition()
        .duration(1000)
        .attr('fill', 'none')
        .attr('stroke', color(type))
        .attr('stroke-width', lineWidth)
        .attr('d', d3.line()
          .x(function(d){ return xScale(d.created); })
          .y(function(d){ return yScale(d.desired); })
        );

    // Update Select
    updatePlantSelect(plantid);

    // Update Title
    title
      .text(getTitle(type));

      // Update X
    xAxisLabel
      .text('Time');

      // Update Y
    yAxisLabel
      .text(getYLabel(type));
  });
}

function selectPill(event){
  event.preventDefault(); // Prevent scrolling up on data change
  $(`div.${event.data.str}-pills a.selected`).addClass('badge-light');
  $(`div.${event.data.str}-pills a.selected`).removeClass('badge-dark');
  $(`div.${event.data.str}-pills a.selected`).removeClass('selected');
  $(this).removeClass('badge-light');
  $(this).addClass('badge-dark');
  $(this).addClass('selected');
  updateChart();
}

$(document).ready(function(){
  $('div.empty').width($('div.type-pills').width()); // to center the svg

  $('div.type-pills a').on('click', {str: 'type'}, selectPill);
  $('div.time-pills a').on('click', {str: 'time'}, selectPill);
  $('select#plant-select').on('change', function(event){
    updateChart();
    event.stopPropagation();
    if(!$(this).val()) return;
    $.ajax({ type: "GET",
        url: `/data/plant/${$(this).val()}/pid`,
        async: true,
        success : function(plant){
          [plant] = plant; // remove array wrapper
          if(!plant.mc){
            $('button#registerPlant').show({duration: 800});
          } else {
            $('button#registerPlant').hide({duration: 400});
          }
        }
      });
    $.ajax({ type: "GET",
        url: `/data/message/${$(this).val()}/pid`,
        async: true,
        success : function(messages){
          $('div.alert').each(function(i){
            $(this).remove();
          });

          var str = "";
          messages.forEach((message, index) => {
            str +=
            `
            <div class="alert alert-${ message.type } alert-dismissible fade show" role="alert" data-id="${ message._id }">
              ${ message.message }
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            `
          });
          $('div.messages > div.container').append(str);

        }
      });
  });

  $('button#registerPlant').on('click', function(event){
    $.post( "/config/new", { plant: $('select#plant-select').val() });
    $(this).hide({duration: 400});
  });

  $('div.alert button.close').on('click', function(){
    $.ajax({ type: 'DELETE',
             url: `/data/message/${$(this).parent().data('id')}/pid`,
             async: true,
             success : function(messages){
               console.log('successfully deleted');
             }
    });
  });

  $('.modal').on('hide.bs.modal', function(){
    var [time, plantid, type] = getSelection();
    if(!plantid) return;
    updatePlantSelect(plantid);
  });

  initializeChart();
  setInterval(updateChart, 30 * 1000);
});
