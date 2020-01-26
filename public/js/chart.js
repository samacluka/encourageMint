(function () {
  'use strict'
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
}())

