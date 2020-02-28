function postNewPlant(){
  $.post( "/newPlant",{
                        Name: $('input#newPlantName').val(),
                        Type: $('select#newPlantType').val(),
                        Owner: $('a#navbarDropdown').data("uid"),
                        soilMoistureMin: $('input#newSoilMoistureMin').val(),
                        soilMoistureMax: $('input#newSoilMoistureMax').val(),
                        lightThresholdMin: $('input#newLightMin').val(),
                        lightThresholdMax: $('input#newLightMax').val()
                      }
        ).done(function(){
          $('div#newPlantModal input').val('');
          $('select#newPlantType').prop('selectedIndex',0);
        });
}

function updatePlantForm(){
  $.get(`/data/plant/${$('a#navbarDropdown').data("uid")}/uid`)
   .done(function( plants ){
      var str = "";

      plants.forEach((plant, index) => {
        if($('select#plant-select option:selected').val() === plant._id){
          str += `<option value="${plant._id}" selected>${plant.Name}</option>`;
        } else {
          str += `<option value="${plant._id}">${plant.Name}</option>`;
        }
      });

      $('select#update-plant-select').html(str);
      
      $.get(`/data/plant/${$('select#update-plant-select option:selected').val()}/pid`)
       .done(function( data ) {
          [data] = data; // remove array wrapping
          $('input#updatePlantName').val(data.Name);
          $('select#updatePlantType').val(data.Type);
          $('input#updateSoilMoistureMin').val(data.soilMoisture.min);
          $('input#updateSoilMoistureMax').val(data.soilMoisture.max);
          $('input#updateLightMin').val(data.lightThreshold.min);
          $('input#updateLightMax').val(data.lightThreshold.max);
      });
  });
}

function updatePlant(){
  $.ajax({
    url: '/updatePlant',
    type: 'PUT',
    data: {
            plantid: $('select#update-plant-select').val(),
            Name: $('input#updatePlantName').val(),
            Type: $('select#updatePlantType').val(),
            Owner: $('a#navbarDropdown').data("uid"),
            soilMoistureMin: $('input#updateSoilMoistureMin').val(),
            soilMoistureMax: $('input#updateSoilMoistureMax').val(),
            lightThresholdMin: $('input#updateLightMin').val(),
            lightThresholdMax: $('input#updateLightMax').val()
          },
    success: function(result) {
        console.log(result);
    }
  });
}

function deletePlant(){
  $.ajax({
    url: '/deletePlant',
    type: 'DELETE',
    data: { id: $('select#update-plant-select option:selected').val() }
  });

  $('select#update-plant-select').prop('selectedIndex',0);
}

$(document).ready(function(){
    $('div#newPlantModal button#newPlantSubmit').on('click', postNewPlant);
    $('#updatePlantModal').on('show.bs.modal', updatePlantForm);
    $('#update-plant-select').on('change', updatePlantForm);
    $('#updatePlantSubmit').on('click', updatePlant);
    $('#deletePlant').on('click', deletePlant);
});
