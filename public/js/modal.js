function addAlertBullet(message){
  $('#alertModalList').append(`<li>${message}</li>`);
  return 1;
}

function showAlertModal(from){
  $(`#alertModal`).unbind('hide.bs.modal'); // Remove any previously set functionalities
  $(`#alertModal`).on('hide.bs.modal', function (e) {
      $(`#${from}PlantModal`).modal('show'); // Re show 'from' modal when alert modal closes
      $('#alertModalList').html(''); // Clear the list
  });
  $(`#${from}PlantModal`).modal('hide'); // hide 'from' modal
  $('#alertModal').modal('show'); // Show alert modal
}

function dataValidation(from){
    var obj = {
                plantid: $('select#update-plant-select').val(),
                Name: $(`input#${from}PlantName`).val(),
                Type: $(`select#${from}PlantType`).val(),
                Owner: $(`a#navbarDropdown`).data("uid"),
                soilMoistureMin: $(`input#${from}SoilMoistureMin`).val(),
                soilMoistureMax: $(`input#${from}SoilMoistureMax`).val(),
                lightThresholdMin: $(`input#${from}LightMin`).val(),
                lightThresholdMax: $(`input#${from}LightMax`).val()
              };

    var numMessages = 0;

    if(obj.Name === "") numMessages += addAlertBullet('Name must not be blank');

    if(obj.Name.length > 17) numMessages += addAlertBullet('Name must be less than 16 characters');

    if(obj.lightThresholdMin > 24 || obj.lightThresholdMin < 0) numMessages += addAlertBullet('Minimum light hours must be between 0 and 24 hours');

    if(obj.lightThresholdMax > 24 || obj.lightThresholdMax < 0) numMessages += addAlertBullet('Maximum light hours must be between 0 and 24 hours');

    if(obj.lightThresholdMax < obj.lightThresholdMin) numMessages += addAlertBullet('Maximum Light Hours must be greater than or equal to Minimum Light Hours');

    if(obj.soilMoistureMax > 850 || obj.soilMoistureMax < 375) numMessages += addAlertBullet('Maximum Soil Moisture must be between 375 and 850');

    if(obj.soilMoistureMin > 850 || obj.soilMoistureMin < 375) numMessages += addAlertBullet('Minimum Soil Moisture must be between 375 and 850');

    if(obj.soilMoistureMax < obj.soilMoistureMin) numMessages += addAlertBullet('Maximum Soil Moisture must be greater than or equal to Minimum Soil Moisture');

    if(numMessages > 0){
      showAlertModal(from);
      return null;
    }

    return(obj);
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
