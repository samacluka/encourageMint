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

function updatePlantForm(event){
  var usePlant;
  if(event.data.from === 'show'){
    usePlant = $('select#plant-select option:selected').val();
  } else {
    usePlant = $('select#update-plant-select option:selected').val();
  }

  $.get(`/data/plant/${$('a#navbarDropdown').data("uid")}/uid`)
   .done(function( plants ){
      var str = "";

      plants.forEach((plant, index) => {
        if(usePlant === plant._id){
          str += `<option value="${plant._id}" selected>${plant.Name}</option>`;
        } else {
          str += `<option value="${plant._id}">${plant.Name}</option>`;
        }
      });

      $('select#update-plant-select').html(str);
  });

  $.get(`/data/plant/${ usePlant }/pid`)
   .done(function( data ) {
      [data] = data; // remove array wrapping
      $('input#updatePlantName').val(data.Name);
      $('select#updatePlantType').val(data.Type);
      $('input#updateSoilMoistureMin').val(data.soilMoisture.min);
      $('input#updateSoilMoistureMax').val(data.soilMoisture.max);
      $('input#updateLightMin').val(data.lightThreshold.min);
      $('input#updateLightMax').val(data.lightThreshold.max);
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
    }
  });
}

function deletePlant(){
  $.ajax({
    url: '/deletePlant',
    type: 'DELETE',
    data: { id: $('select#update-plant-select option:selected').val() },
    success: function(){
    }
  });

  $('select#update-plant-select').prop('selectedIndex',0);
}

function loadDefault(event){
  console.log($(this).val());
  $.get(`/data/default/${$(this).val()}`)
   .done(function( data ){
     [data] = data; // removed array wrapper
     if(!data) return;
     if(event.data.from === 'new'){
       $('select#newPlantType').parent().siblings('div.form-group.row').children('input#newSoilMoistureMax').val(data.soilMoisture.max);
       $('select#newPlantType').parent().siblings('div.form-group.row').children('input#newSoilMoistureMin').val(data.soilMoisture.min);
       $('select#newPlantType').parent().siblings('div.form-group.row').children('input#newLightMax').val(data.lightThreshold.max);
       $('select#newPlantType').parent().siblings('div.form-group.row').children('input#newLightMin').val(data.lightThreshold.min);
     } else {
       $('select#updatePlantType').parent().siblings('div.form-group.row').children('input#updateSoilMoistureMax').val(data.soilMoisture.max);
       $('select#updatePlantType').parent().siblings('div.form-group.row').children('input#updateSoilMoistureMin').val(data.soilMoisture.min);
       $('select#updatePlantType').parent().siblings('div.form-group.row').children('input#updateLightMax').val(data.lightThreshold.max);
       $('select#updatePlantType').parent().siblings('div.form-group.row').children('input#updateLightMin').val(data.lightThreshold.min);
     }
  });
}

$(document).ready(function(){
    $('div#newPlantModal button#newPlantSubmit').on('click', postNewPlant);
    $('#updatePlantModal').on('show.bs.modal', {from: 'show'}, updatePlantForm);
    $('#update-plant-select').on('change', {from: 'update'}, updatePlantForm);
    $('#updatePlantSubmit').on('click', updatePlant);
    $('#deletePlant').on('click', deletePlant);
    $('#newPlantType').on('change', {from: 'new'}, loadDefault);
    $('#updatePlantType').on('change', {from: 'update'}, loadDefault);
});
