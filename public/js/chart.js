organizeData = function(){
     $.ajax({ type: "GET",
         url: "/index/data",
         async: true,
         success : function(logs){

           var labels = [];
           var temperature = [];
           var humidity = [];
           var light = [];
           var soilMoisture = [];
           var data;

           logs.forEach((log) => {
             labels.push(log.created);
             temperature.push(log.temperature);
             humidity.push(log.humidity);
             light.push(log.light);
             soilMoisture.push(log.soilMoisture);
           });

           if($("input[name='chart-select']:checked").val() == "temperature"){
             data = {
               data: temperature,
               lineTension: 0,
               backgroundColor: 'transparent',
               borderColor: '#ff0000',
               borderWidth: 4,
               pointBackgroundColor: '#ff0000'
             }
           } else if($("input[name='chart-select']:checked").val() == "humidity"){
             data = {
               data: humidity,
               lineTension: 0,
               backgroundColor: 'transparent',
               borderColor: '#1fc8de',
               borderWidth: 4,
               pointBackgroundColor: '#1fc8de'
             }
           } else if($("input[name='chart-select']:checked").val() == "light"){
             data = {
               data: light,
               lineTension: 0,
               backgroundColor: 'transparent',
               borderColor: '#e3b92d',
               borderWidth: 4,
               pointBackgroundColor: '#e3b92d'
             }
           } else if($("input[name='chart-select']:checked").val() == "soilMoisture"){
             data = {
               data: soilMoisture,
               lineTension: 0,
               backgroundColor: 'transparent',
               borderColor: '#734500',
               borderWidth: 4,
               pointBackgroundColor: '#734500'
             }
           } else {
             data = {}
           }

           makeChart(labels, data);
         }
    });
}

makeChart = function(labels, data){
  feather.replace();

  var elements = $("#myChart");
  for (var i=0; i<elements.length; i=i+1) {
    var myChart = new Chart(elements[i], {
      type: 'line',
      data: {
        labels: labels,
        datasets: [data]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        },
        legend: {
          display: false
        }
      }
    })
  }
}


$(document).ready(organizeData);
$("input[name='chart-select']").on("click",organizeData);
setInterval(organizeData, 30000);
