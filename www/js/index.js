
(function () {
    "use strict";

    var client,             // Connection to the Azure Mobile App backend
            table_Schlagloch;      // Reference to a table endpoint on backend
     var image;
     var beschreibung, breitengrad, laengengrad, marker;
     var aktPosLaengengrad, aktPosBreitengrad;
     var schlaglochArray;
     schlaglochArray = new Array();
     var i;


     //Add an event listener to call our initialization routine when the host is ready
     document.addEventListener('deviceready', onDeviceReady, false);
     
    /**
     * Event Handler, called when the host is ready
     *
     * @event
     */
    function onDeviceReady() {
        // Create a connection reference to our Azure Mobile Apps backend
        client = new WindowsAzure.MobileServiceClient('https://schlaglochapp.azurewebsites.net');

        // Create a table reference
        table_Schlagloch = client.getTable('table_Schlagloch');
       
        //open Foto
        $('#btn_Foto').on('click', foto);

        //adding Schlagloch to Azure
        $('#hinzufuegen').on('click', addItemHandler);

        //Get current position
        GPSCheckUp();

       // Refresh the todoItems
        getDataAzure();
        
    }

    function getDataAzure() {
       // Execute a query for uncompleted items and process
        table_Schlagloch
            .where({ complete: false })     // Set up the query
            .read()                         // Read the results
            .then(createSchlaglochList, handleError);
    }


    function createSchlagloch(item) {
        //save each Schlagloch from azure to array
        var string = item.breitengrad + ";" + item.laengengrad +";"+item.beschreibung;
        schlaglochArray[i] = string;
        i = i + 1;

    }

    function createSchlaglochList(items) {
        // Cycle through each item received from Azure and add items to the item list
        i = 0;
        var listItems = $.map(items, createSchlagloch);
      
        //Set Map
        var curPos = { lat: aktPosBreitengrad, lng:aktPosLaengengrad};
        var map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: curPos
        });

        //set Marker
        for (var j = 0; j < schlaglochArray.length; j++)
        {
            //split spring of index
            var coordinaten = schlaglochArray[j].split(';');
            var beschreib = coordinaten[2];
            var beschreibIndex = 0;

            //set Marker to Map
            var location = new google.maps.LatLng( coordinaten[0], coordinaten[1]);
            marker = new google.maps.Marker({
                position: location,
                label: beschreib[beschreibIndex++ % beschreib.length],
                map: map
            });
        }
}

    /**
     * Handle error conditions
     * @param {Error} error the error that needs handling
     * @returns {void}
     */
    function handleError(error) {
        var text = error + (error.request ? ' - ' + error.request.status : '');
        console.error(text);
        $('#errorlog').append($('<li>').text(text));
    }


    /**
     * Event handler for when the user enters some text and clicks on Add
     * @param {Event} event the event that caused the request
     * @returns {void}
     */
    function addItemHandler(event) {
       var textbox = $('#new-item-text'),
           itemText = textbox.val();

       if (itemText !== '') {
           table_Schlagloch.insert({
              beschreibung: itemText,
              breitengrad: aktPosBreitengrad,
              laengengrad: aktPosLaengengrad,               
              complete: false
           }).then(handleError);
           alert("Schlagloch erfolgreich hinzugefügt");
       }

       textbox.val('').focus();
       event.preventDefault(); 
        
    }

    //Check if GPS is aktiv and get current position
    function GPSCheckUp(){

        var onSuccess = function(position) {
           // $('#txtHomescreenGPSCheckUp').append('<p>GPS ist aktiv!</p>');
            aktPosBreitengrad = position.coords.latitude;
            aktPosLaengengrad = position.coords.longitude;
            $('#txtFotoGPSKoordinaten').append('<p> GPS Koordinaten:<br> Breitengrad: ' + position.coords.latitude + '<br> Laengengrad: ' + position.coords.longitude + '</p>');
        

        };
        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                  'message: ' + error.message + '\n');
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);


    }

    //take foto
    function foto() {

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,
            endcodingType: 0
        });
        function onSuccess(imageData) {

           var image = "data:image/jpeg;base64," + imageData;
          
            $('#imgFotoSchlagloch').attr('src', image);
            var image = imageData;
        }
        

        function onFail(message) {
            console.log('failed because: ' + message);
        }
    }
    
    
  
})();