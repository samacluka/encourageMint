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
var minText;
var maxText;

var data;

var isInitialized = false;

function color(type){
  switch(type) {
    case "temperature":
      return '#bf0000';
    case "humidity":
      return '#b80099';
    case "soilMoisture":
      return '#0300bf';
    case "light":
      return '#FFD700';
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
      return 'Humidity (%)';
    case "soilMoisture":
      return 'Soil Moisture (%)';
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

function setScales(time, type, Data){
  var now = new Date().getTime();
  var prev = now - parseInt(time) * 60 * 60 * 1000;

  // Add padding to data range inversely purportional to original range
  var y;
  if(type === 'soilMoisture'){ // If type is soilMoisture limit to between 0% and 100%
    // padding can range from +/- 20 to +/- 100 AND limited from 0 to 100 (%)
    y = d3.extent(Data.filter(d => d.created > new Date().getTime() - time * 60 * 60 * 1000), d => d.desired).map((x, i, a) => i ? Math.min(1000, x+20/(a[1]-a[0] > 0.2 ? a[1] - a[0] : 1)) : Math.max(0, x-20/(a[1]-a[0] > 0.2 ? a[1] - a[0] : 1)));
  } else if(type === 'light'){
    // padding can range from +/- 5 to +/- 10 AND limited from 0 to 24 (hours)
    y = d3.extent(Data.filter(d => d.created > new Date().getTime() - time * 60 * 60 * 1000), d => d.desired).map((x, i, a) => i ? Math.min(24, x+5/(a[1]-a[0] > 0.5 ? a[1] - a[0] : 1)) : Math.max(0, x-5/(a[1]-a[0] > 0.5 ? a[1] - a[0] : 1)));
  } else if(type === 'temperature'){
    // padding can range from +/- 10 to +/- 20 AND limited from 0 to 50
    y = d3.extent(Data.filter(d => d.created > new Date().getTime() - time * 60 * 60 * 1000), d => d.desired).map((x, i, a) => i ? Math.min(50, x+10/(a[1]-a[0] > 0.5 ? a[1] - a[0] : 1)) : Math.max(0, x-10/(a[1]-a[0] > 0.5 ? a[1] - a[0] : 1)));
  } else {
    // padding can range from +/- 10 to +/- 50 AND limited from 0 to inf
    y = d3.extent(Data.filter(d => d.created > new Date().getTime() - time * 60 * 60 * 1000), d => d.desired).map((x, i, a) => i ? x+10/(a[1]-a[0] > 0.2 ? a[1] - a[0] : 1) : Math.max(0, x-10/(a[1]-a[0] > 0.2 ? a[1] - a[0] : 1)));
  }

  yScale = d3.scaleLinear()
               // .domain(d3.extent(Data, d => d.desired)) // Stretch available data across whole range
               .domain(y)
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

function getData(period = 168){
  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  d3.json(`/data/log/${plantid}/${period}`, function(Data){
    data = formatData(type, Data);
  });
}

function updateGraph(){
  if(!isInitialized){
    initGraph();
    return;
  }

  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  // d3.json(`/data/log/${plantid}/${time}`, function(Data){
    if(!data) return;
    data = formatData(type, data);

    setScales(time, type, data);

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
      .datum(data.filter(d => d.created > new Date().getTime() - time * 60 * 60 * 1000))
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
            if(defaultPlant[0].desired.max > yScale.domain()[1]) throw new Error('Max setpoint outside of Chart Y Axis boundries');
            maxThreshold
              .datum(defaultPlant)
                .transition()
                .duration(1000)
                .attr('d', d3.line()
                  .x(function(d){ return xScale(d.created); })
                  .y(function(d){ return yScale(d.desired.max); })
                );

            maxText
              .transition()
              .duration(1000)
              .attr('x', width - padding/2)
              .attr('y', yScale(defaultPlant[0].desired.max))
              .text('Max');
          } catch (e) {
            if(e instanceof TypeError || e.message === 'Max setpoint outside of Chart Y Axis boundries'){
              maxThreshold
                .transition()
                .duration(1000)
                .attr('d','');

              maxText.text('');
            } else {
              console.log(e);
            }
          }

          try {
            if(defaultPlant[0].desired.min < yScale.domain()[0]) throw new Error('Min setpoint outside of Chart Y Axis boundries');
            minThreshold
              .datum(defaultPlant)
                .transition()
                .duration(1000)
                .attr('d', d3.line()
                  .x(function(d){ return xScale(d.created); })
                  .y(function(d){ return yScale(d.desired.min); })
                );

            minText
              .transition()
              .duration(1000)
              .attr('x', width - padding/2)
              .attr('y', yScale(defaultPlant[0].desired.min))
              .text('Min');
          } catch (e) {
            if(e instanceof TypeError || e.message === 'Min setpoint outside of Chart Y Axis boundries'){
              minThreshold
                .transition()
                .duration(1000)
                .attr('d','');

              minText.text('');
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
  // });
}

function initGraph(){
  height = $(window).height()*0.75;
  width = $(window).width()*0.8;
  padding = (50 / 650) * width;

  if(svg) svg.remove();

  var [time, plantid, type] = getSelection();
  if(!plantid) return;

  d3.json(`/data/log/${plantid}/${ isInitialized ? time : 1 }`, function(Data){
    data = formatData(type, Data);
    if(!data) return;

    setScales(time, type, data);

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
            .datum(data.filter(d => d.created > new Date().getTime() - time * 60 * 60 * 1000))
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

          minText = svg
                      .append('text')
                        .attr('id','minText')
                        .style('text-anchor','middle')
                        .text('Min');

          maxText = svg
                      .append('text')
                        .attr('id','maxText')
                        .style('text-anchor','middle')
                        .text('Max');

          try {
            if(defaultPlant[0].desired.max > yScale.domain()[1]) throw new Error('Max setpoint outside of Chart Y Axis boundries');

            maxThreshold
              .attr('d', d3.line()
                .x(function(d){ return xScale(d.created); })
                .y(function(d){ return yScale(d.desired.max); })
              );

            maxText.text('Max');
          } catch (e) {
              if(e instanceof TypeError || e.message === 'Max setpoint outside of Chart Y Axis boundries'){
                maxThreshold.attr('d', '');
                maxText.text('');
              } else {
                console.log(e);
              }
          }

          try {
            if(defaultPlant[0].desired.min < yScale.domain()[0]) throw new Error('Min setpoint outside of Chart Y Axis boundries');

            minThreshold
              .attr('d', d3.line()
                .x(function(d){ return xScale(d.created); })
                .y(function(d){ return yScale(d.desired.min); })
              );

            minText.text('Min');
          } catch (e) {
            if(e instanceof TypeError || e.message === 'Min setpoint outside of Chart Y Axis boundries'){
              minThreshold.attr('d', '');
              minText.text('');
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

function selectPill(event){
  event.preventDefault(); // Prevent scrolling up on data change
  $(`div.${event.data.str}-pills a.selected`).addClass('badge-light');
  $(`div.${event.data.str}-pills a.selected`).removeClass('badge-dark');
  $(`div.${event.data.str}-pills a.selected`).removeClass('selected');
  $(this).removeClass('badge-light');
  $(this).addClass('badge-dark');
  $(this).addClass('selected');
  updateGraph();
}

function loadAlerts(){
  plantid = $('select#plant-select').val();
  if(!plantid) return;
  $.ajax({ type: "GET",
      url: '/data/message',
      data: { id: plantid },
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
            <small>${ date.getDate() }/${ date.getMonth()+1 }/${ date.getFullYear() }:</small>
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

function registerButton(plantid = $('select#plant-select').val()){
  if(!plantid) throw new Error('No plant ID in main select');
  $.ajax({ type: "GET",
      url: '/config/success',
      data: {plant: plantid},
      async: true,
      success: function(config){
        [config] = JSON.parse(config); // Convert string to JSON Remove array wrapper
        if(config){
          let now = new Date();
          let created = new Date(config.created);
          let elapsed = now.getTime() - created.getTime();

          if((elapsed < 5 * 60 * 1000) && !config.success || config.success){ // Config has started or completed successful
            $('button#registerPlant').hide({duration: 400});
          } else if((elapsed >= 5 * 60 * 1000) && !config.success){ // Config failed
            $(`select#plant-select option[value="${ plantid }"]`).prop('selected',true);
            $('button#registerPlant').html('<small>Association Failed. Please Try Connecting Again</small>');
            $('button#registerPlant').show({duration: 800});
          }
        } else {                                                // No config
          $('button#registerPlant').html('Connect Plant');
          $('button#registerPlant').show({duration: 800});
        }
      }
  })
}

$(document).ready(function(){
  $('div.empty').width($('div.type-pills').width()); // to center the svg

  $('div.type-pills a').on('click', {str: 'type'}, selectPill);
  $('div.time-pills a').on('click', {str: 'time'}, selectPill);
  $('select#plant-select').on('change', function(event){
    event.stopPropagation();
    registerButton();
    loadAlerts();
    updateGraph();
  });

  $('button#registerPlant').on('click', function(event){
    var plantid = $('select#plant-select').val();
    $.post("/config/new", { plant: plantid });
    $(this).hide({duration: 400});
    $(this).html('Connect Plant');
    setTimeout(function(){
      registerButton(plantid);
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
  $('button.delete-log').on('click', function(event){
    $.ajax({ type: "DELETE",
        url: '/data/deleteLogs',
        data: { plant: $('select#plant-select').val(), time: $(this).data('time') },
        async: true,
        success: function(){
          registerButton();
          loadAlerts();
          updateGraph();
        }
    });
  });

  $('input#email').on('click', function(){
    $.ajax({
      url: '/data/notifications',
      type: 'PUT',
      data: { checked: $('input#email').prop('checked'), user: $('a#navbarDropdown').data("uid") }
    });
  });

  var debInitGraph = _.debounce(initGraph, 300);
  $(window).on('resize', debInitGraph);

  setTimeout(registerButton, 200);
  setTimeout(loadAlerts, 200);
  setTimeout(initGraph, 200);
  setTimeout(getData, 50);

  setInterval(function(){
    getData();
    updateGraph();
    loadAlerts();
  }, 30 * 1000);
});
