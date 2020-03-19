module.exports = function(obj){
    if(obj.Name === "") return null;
    if(obj.Name.length > 17) return null;

    if(obj.lightThresholdMin > 24) return null;
    if(obj.lightThresholdMin < 0) return null;
    if(obj.lightThresholdMax > 24) return null;
    if(obj.lightThresholdMax < 0) return null;
    if(obj.lightThresholdMax < obj.lightThresholdMin) return null;

    if(obj.soilMoistureMin > 850) return null;
    if(obj.soilMoistureMin < 375) return null;
    if(obj.soilMoistureMax > 850) return null;
    if(obj.soilMoistureMax < 375) return null;
    if(obj.soilMoistureMax < obj.soilMoistureMin) return null;

    return(obj);
}
