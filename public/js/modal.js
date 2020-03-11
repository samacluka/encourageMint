async function updateSelects(plantid=-1){
  var numPlants;
  await $.ajax({ type: "GET",
      url: '/data/plant',
      data: {id: $('a#navbarDropdown').data("uid"), type: 'uid'},
      async: false,
      success: function( plants ){
         var str = "";

         plants.forEach((plant, index) => {
           if((plantid !== -1 && plantid === plant._id) || (plantid === -1 && index === 0)){
             str += `<option value="${plant._id}" selected>${plant.Name}</option>`;
           } else {
             str += `<option value="${plant._id}">${plant.Name}</option>`;
           }
         });

         $('select#update-plant-select').html(str);
         $('select#plant-select').html(str);
         numPlants = plants.length;
     }
  });
  // Timeout need so the select has time to load data
  setTimeout(loadAlerts, 300); // function from ./index.js
  setTimeout(registerButton, 300); // function from ./index.js
  return Promise.resolve(numPlants); // calling this function returns the number of plants before any addition or deletion even
}

function newPlant(){
  $.post( "/data/newPlant", {
                        Name: $('input#newPlantName').val(),
                        Type: $('select#newPlantType').val(),
                        Owner: $('a#navbarDropdown').data("uid"),
                        soilMoistureMin: $('input#newSoilMoistureMin').val(),
                        soilMoistureMax: $('input#newSoilMoistureMax').val(),
                        lightThresholdMin: $('input#newLightMin').val(),
                        lightThresholdMax: $('input#newLightMax').val()
                      }
        ).done(function( result ){
          $('div#newPlantModal input').val('');
          $('select#newPlantType').prop('selectedIndex',0);
          updateSelects(result._id).then((numPlants) => {
            if(numPlants === 1) location.reload();
          });
        });
}

function updatePlant(){
  $.ajax({
    url: '/data/updatePlant',
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
      updateSelects($('select#update-plant-select').val());
    }
  });
}

function deletePlant(){
  $.ajax({
    url: '/data/deletePlant',
    type: 'DELETE',
    data: { id: $('select#update-plant-select option:selected').val() },
    success: function(){
      updateSelects().then((numPlants) => {
        if(numPlants === 0) location.reload();
      });
    }
  });
}

function updatePlantForm(event){
  var plantid;
  if(event.data.from === 'show'){
    plantid = $('select#plant-select option:selected').val();
  } else {
    plantid = $('select#update-plant-select option:selected').val();
  }

  updateSelects(plantid);

  $.ajax({ type: "GET",
      url: '/data/plant',
      data: {id: plantid, type: 'pid'},
      async: true,
      success: function( data ) {
         [data] = data; // remove array wrapping
         $('input#updatePlantName').val(data.Name);
         $('select#updatePlantType').val(data.Type);
         $('input#updateSoilMoistureMin').val(data.soilMoisture.min);
         $('input#updateSoilMoistureMax').val(data.soilMoisture.max);
         $('input#updateLightMin').val(data.lightThreshold.min);
         $('input#updateLightMax').val(data.lightThreshold.max);
     }
  });
}

function loadDefault(event){
  var from = event.data.from;

  $.get('/data/default', { type: $(`select#${from}PlantType`).val() })
   .done(function( data ){
     [data] = data; // removed array wrapper
     if(!data) return;

     $(`select#${from}PlantType`).parent().siblings('div.form-group.row').children(`input#${from}SoilMoistureMax`).val(data.soilMoisture.max);
     $(`select#${from}PlantType`).parent().siblings('div.form-group.row').children(`input#${from}SoilMoistureMin`).val(data.soilMoisture.min);
     $(`select#${from}PlantType`).parent().siblings('div.form-group.row').children(`input#${from}LightMax`).val(data.lightThreshold.max);
     $(`select#${from}PlantType`).parent().siblings('div.form-group.row').children(`input#${from}LightMin`).val(data.lightThreshold.min);
  });
}

function modalKeypress(event) {
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
     event.data.cb();
     $(this).modal('hide');
  }
}

$(document).ready(function(){
    updateSelects();
    $('#newPlantModal').on('keypress', {cb: newPlant}, modalKeypress);
    $('#newPlantSubmit').on('click', newPlant);

    $('#updatePlantModal').on('keypress', {cb: updatePlant}, modalKeypress);
    $('#updatePlantSubmit').on('click', updatePlant);
    $('#deletePlant').on('click', deletePlant);

    $('#updatePlantModal').on('show.bs.modal', {from: 'show'}, updatePlantForm);
    $('#update-plant-select').on('change', {from: 'update'}, updatePlantForm);

    $('#newPlantModal').on('show.bs.modal', {from: 'new'}, loadDefault);
    $('#newPlantType').on('change', {from: 'new'}, loadDefault);
    $('#updatePlantType').on('change', {from: 'update'}, loadDefault);
});
