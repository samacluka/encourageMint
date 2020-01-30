$(document).ready(function(){
     $.ajax({ type: "GET",
         url: "/index/data",
         async: true,
         success : function(logs){
             mc(logs);
         }
    });

});

mc = function(logs) {
  feather.replace();

  var labels1 = [];
  var data1 = [];
  logs.forEach((log) => {
    labels1.push(log.created);
    data1.push(log.soilMoisture);
  });

  var elements = document.getElementsByClassName("myChart");
  for (var i=0; i<elements.length; i=i+1) {
    var myChart = new Chart(elements[i], {
      type: 'line',
      data: {
        /* TODO: Figure out labels*/
        labels: labels1,
        datasets: [{
          /* TODO: Figure out how to fill out the data*/
          data: data1,
          lineTension: 0,
          backgroundColor: 'transparent',
          borderColor: '#007bff',
          borderWidth: 4,
          pointBackgroundColor: '#007bff'
        }]
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

makeChart = function(logs) {
  feather.replace()
  var elements = document.getElementsByClassName("myChart");
  for (var i=0; i<elements.length; i=i+1) {
    var myChart = new Chart(elements[i], {
      type: 'line',
      data: {
        /* TODO: Figure out labels*/
        labels: [
          "First",
          "Second",
          "Third",
          "Fourth"
        ],
        datasets: [{
          /* TODO: Figure out how to fill out the data*/
          data: [
            1,
            2,
            3,
            4
          ],
          lineTension: 0,
          backgroundColor: 'transparent',
          borderColor: '#007bff',
          borderWidth: 4,
          pointBackgroundColor: '#007bff'
        }]
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
