function dataValidation(from){
    var plantid = $('select#update-plant-select').val(),
    Name = $(`input#${from}PlantName`).val(),
    Type = $(`select#${from}PlantType`).val(),
    Owner = $(`a#navbarDropdown`).data("uid"),
    soilMoistureMin = $(`input#${from}SoilMoistureMin`).val(),
    soilMoistureMax = $(`input#${from}SoilMoistureMax`).val(),
    lightThresholdMin = $(`input#${from}LightMin`).val(),
    lightThresholdMax = $(`input#${from}LightMax`).val();

    if(lightThresholdMin > 24 || lightThresholdMin < 0) return null;
    if(lightThresholdMax > 24 || lightThresholdMax < 0) return null;
    if(lightThresholdMax < lightThresholdMin) return null;

    if(soilMoistureMax > 850 || soilMoistureMax < 375) return null;
    if(soilMoistureMin > 850 || soilMoistureMin < 375) return null;
    if(soilMoistureMax < soilMoistureMin) return null;

    if(Name === "") return null;

    return({
      plantid: plantid,
      Name: Name,
      Type: Type,
      Owner: Owner,
      soilMoistureMin: soilMoistureMin,
      soilMoistureMax: soilMoistureMax,
      lightThresholdMin: lightThresholdMin,
      lightThresholdMax: lightThresholdMax
    });
}

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
  var data = dataValidation('new');
  if(!data) return;
  $('#newPlantModal').modal('hide');
  $.post( "/data/newPlant", data)
    .done(function( result ){
      $('div#newPlantModal input').val('');
      $('select#newPlantType').prop('selectedIndex',0);
      updateSelects(result._id).then((numPlants) => {
        if(numPlants === 1) location.reload();
      });
    });
}

function updatePlant(){
  var data = dataValidation('update');
  if(!data) return;
  $('#updatePlantModal').modal('hide');
  $.ajax({
    url: '/data/updatePlant',
    type: 'PUT',
    data: data,
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
