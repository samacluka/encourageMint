var height; // 650
var width; // 1200
var padding; // 50

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
var maxThreshold;
var minThreshold;

var data;

var isInitialized = false;

function buildSVG(){
  height = $(window).height()*0.75;
  width = $(window).width()*0.8;
  padding = (50 / 650) * width;

  if(svg) svg.remove();

  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  d3.json(`/data/log/${plantid}/${time}`, function(Data){
    data = formatData(type, Data);
    if(!data) return;

    setScales(time, data);

    d3.select('div.svg')
      .append('svg')
        .attr('version',1.1)
        .attr('baseProfile', 'full')
        .attr('xmlns', 'http://www.w3.org/2000/svg');

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

    $.ajax({ type: "GET",
        url: '/data/default',
        data: { type: $('select#updatePlantType').val() },
        async: true,
        success : function(defaultPlant){
          defaultPlant = formatDefaultData(type, time, defaultPlant);
          maxThreshold = svg
                          .append('path')
                          .datum(defaultPlant)
                            .attr('fill', 'none')
                            .attr('stroke', '#4e5f70e8')
                            .attr('stroke-width', lineWidth-2)
                            .attr('stroke-dasharray', '25,5');

          minThreshold = svg
                          .append('path')
                          .datum(defaultPlant)
                            .attr('fill', 'none')
                            .attr('stroke', '#4e5f70e8')
                            .attr('stroke-width', lineWidth-2)
                            .attr('stroke-dasharray', '25,5');

          try {
            maxThreshold
              .attr('d', d3.line()
                .x(function(d){ return xScale(d.created); })
                .y(function(d){ return yScale(d.desired.max); })
              );

            minThreshold
              .attr('d', d3.line()
                .x(function(d){ return xScale(d.created); })
                .y(function(d){ return yScale(d.desired.min); })
              );

          } catch (e) {
              if(e.name === 'TypeError'){
                maxThreshold.attr('d', '');
                minThreshold.attr('d', '');
              } else {
                console.log(e);
              }
          }
        }
      });

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

    isInitialized = true;
  });
}

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
      return 'Light Hours (Hrs)';
    default:
      return 'Error';
  }
}

function getTimeFormat(time){
  return ((time < 72) ? ('%H:%M') : ('%m/%d - %H:%M'));
}

function formatData(type, Data){
  if(!Data) return Data;
  Data.forEach(function(d,i){
    d.created = new Date(d.created).getTime();
    d.desired = type === 'temperature' ? d.temperature :
                type === 'humidity' ? d.humidity :
                type === 'soilMoisture' ? d.soilMoisture :
                type === 'light' ? d.light : -1;
  });
  return Data;
}

function formatDefaultData(type, time, [defaultPlant]){
  // remove array wrapper in function def
  var now = new Date().getTime();
  var prev = now - parseInt(time) * 60 * 60 * 1000;

  var arr = [];
  var domain = [prev, now];
  domain.forEach(function(d,i){
    arr.push({
      created: d,
      desired: type === 'soilMoisture' ? defaultPlant.soilMoisture :
               type === 'light' ? defaultPlant.lightThreshold : null
    });
  });
  return arr;
}

function setScales(time, Data){
  var now = new Date().getTime();
  var prev = now - parseInt(time) * 60 * 60 * 1000;

  yScale = d3.scaleLinear()
               // .domain(d3.extent(Data, d => d.desired)) // Stretch available data across whole range
               .domain(d3.extent(Data, d => d.desired).map((x, i, a) => i%2 ? x+20/(a[1]-a[0] > 0.2 ? a[1] - a[0] : 1) : Math.max(0, x-20/(a[1]-a[0] > 0.2 ? a[1] - a[0] : 1))))  // Add padding to data range inversely purportional to original range // padding can range from +/- 20 to +/- 100
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

function updateChart(){
  if(!isInitialized) buildSVG();

  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  d3.json(`/data/log/${plantid}/${time}`, function(Data){
    data = formatData(type, Data);
    if(!data) return;

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
        .attr('stroke', color(type))
        .attr('d', d3.line()
          .x(function(d){ return xScale(d.created); })
          .y(function(d){ return yScale(d.desired); })
        );

    $.ajax({ type: "GET",
        url: '/data/default',
        data: { type: $('select#updatePlantType').val() },
        async: true,
        success : function(defaultPlant){
          defaultPlant = formatDefaultData(type, time, defaultPlant);
          try {
            maxThreshold
              .datum(defaultPlant)
                .transition()
                .duration(1000)
                .attr('d', d3.line()
                  .x(function(d){ return xScale(d.created); })
                  .y(function(d){ return yScale(d.desired.max); })
                );

            minThreshold
              .datum(defaultPlant)
                .transition()
                .duration(1000)
                .attr('d', d3.line()
                  .x(function(d){ return xScale(d.created); })
                  .y(function(d){ return yScale(d.desired.min); })
                );
          } catch (e) {
            if(e.name === 'TypeError'){
              maxThreshold
                .transition()
                .duration(1000)
                .attr('d','');

              minThreshold
                .transition()
                .duration(1000)
                .attr('d','');
            } else {
              console.log(e);
            }
          }
        }
      });

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

function loadAlerts(){
  if(!$('select#plant-select').val()) return;
  $.ajax({ type: "GET",
      url: '/data/message',
      data: { id: $('select#plant-select').val() },
      async: true,
      success : function(messages){
        $('div.alert').each(function(i){
          $(this).remove();
        });

        var str = "";
        messages.forEach((message, index) => {
          date = new Date(message.created);
          str +=
          `
          <div class="alert alert-${ message.type } alert-dismissible fade show" role="alert" data-id="${ message._id }">
            <small>${ date.getDate() }/${ date.getMonth() }/${ date.getFullYear() }:</small>
            <span>${ message.message }</span>
            <div class="alertButtons">
              <button type="button" class="close mr-4 px-2" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&minus;</span>
              </button>
              <button type="button" class="close delete px-2" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
          `
        });

        $('div.messages > div.container').append(str);

        $('div.alert button.delete').on('click', function(){
          $.ajax({ type: 'DELETE',
                   url: '/data/message',
                   data: { id: $(this).parent().parent().data('id') },
                   async: true
          });
        });
      }
    });
}

function registerButton(){
  if(!$('select#plant-select').val()) return;
  $.ajax({ type: "GET",
      url: '/data/plant',
      data: {id: $('select#plant-select').val(), type: 'pid'},
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
}

$(document).ready(function(){
  $('div.empty').width($('div.type-pills').width()); // to center the svg

  $('div.type-pills a').on('click', {str: 'type'}, selectPill);
  $('div.time-pills a').on('click', {str: 'time'}, selectPill);
  $('select#plant-select').on('change', function(event){
    event.stopPropagation();
    registerButton();
    loadAlerts();
    updateChart();
  });

  $('button#registerPlant').on('click', function(event){
    var plantid = $('select#plant-select').val();
    $.post("/config/new", { plant: plantid });
    $(this).hide({duration: 400});
    $(this).html('Connect Plant');
    setTimeout(function(){
      $.get("/config/success", { plant: plantid })
        .done(function( data ){
          [data] = JSON.parse(data); // Convert string to JSON Remove array wrapper
          if(!data.success){
            $(`select#plant-select option[value="${ plantid }"]`).prop('selected',true);
            $('button#registerPlant').html('<small>Association Failed. Please Try Connecting Again</small>');
            $('button#registerPlant').show({duration:400});
          }
        });
    }, 5.5 * 60 * 1000); // 5.5 minutes after button click
  });
  $('#deleteAllMessages').on('click', function(event){
    $('div.alert').alert('close');
    $.ajax({ type: "DELETE",
        url: '/data/allMessage',
        data: { plant: $('select#plant-select').val() },
        async: true,
    });
  });

  $('input#email').on('click', function(){
    $.ajax({
      url: '/data/notifications',
      type: 'PUT',
      data: { checked: $('input#email').prop('checked'), user: $('a#navbarDropdown').data("uid") }
    });
  });

  var debBuildSVG = _.debounce(buildSVG, 300);
  $(window).on('resize', debBuildSVG);

  setTimeout(registerButton, 200);
  setTimeout(loadAlerts, 200);
  setTimeout(buildSVG, 200);

  setInterval(updateChart, 30 * 1000);
  setInterval(loadAlerts, 30 * 1000);
});
