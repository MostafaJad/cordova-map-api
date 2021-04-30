var latitude;
var longitude;
var parkedLatitude;
var parkedLongitude;

var storage;

function init() {
  document.addEventListener("deviceready", onDeviceReady, false);
  document
    .getElementById("cameraTakePicture")
    .addEventListener("click", cameraTakePicture);
  document
    .getElementById("cameraGetPicture")
    .addEventListener("click", cameraGetPicture);
  storage = window.localStorage;
}

function cameraTakePicture() {
  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
  });

  function onSuccess(imageData) {
    var image = document.getElementById("myImage");
    image.src = "data:image/jpeg;base64," + imageData;
  }

  function onFail(message) {
    alert("Failed because: " + message);
  }
}
function cameraGetPicture() {
  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
    targetWidth: 50,
    targetHeight: 50,
  });

  function onSuccess(imageData) {
    var image = document.getElementById("myImage");
    image.style.display = "block";

    image.src = "data:image/jpeg;base64," + imageData;
  }

  function onFail(message) {
    alert("Failed because: " + message);
  }
}

function onDeviceReady() {
  var node = document.createElement("link");
  node.setAttribute("rel", "stylesheet");
  node.setAttribute("type", "text/css");
  if (cordova.platformId == "ios") {
    node.setAttribute("href", "parkItios.css");
    window.StatusBar.overlaysWebView(false);
    window.StatusBar.styleDefault();
  } else {
    node.setAttribute("href", "parkItandroid.css");
    window.StatusBar.backgroundColorByHexString("#1565C0");
  }
  document.getElementsByTagName("head")[0].appendChild(node);
}
function setCss(elm, prop, val) {
  var node = document.getElementById(elm).style;
  node.setProperty(prop, val);
}
document.addEventListener("prechange", function (event) {
  document.querySelector(
    "ons-toolbar .center"
  ).innerHTML = event.tabItem.getAttribute("label");
});

function setParkingLocation() {
  navigator.geolocation.getCurrentPosition(
    setParkingLocationSuccess,
    locationError,
    { enableHighAccuracy: true }
  );
}

function setParkingLocationSuccess(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  storage.setItem("parkedLatitude", latitude);
  storage.setItem("parkedLongitude", longitude);
  navigator.notification.alert("Parking Location Was Successfully Saved");
  showParkingLocation();
}

function locationError(error) {
  navigator.notification.alert(
    "Error Code: " + error.code + "\nError Message: " + error.message
  );
}

function showParkingLocation() {
  setCss("directions", "visibility", "hidden");
  setCss("instructions", "display", "none");
  var latLong = new google.maps.LatLng(latitude, longitude);
  var map = new google.maps.Map(document.getElementById("map"));
  map.setZoom(16);
  map.setCenter(latLong);
  var marker = new google.maps.Marker({
    position: latLong,
    map: map,
  });
  setCss("map", "visibility", "visible");
}

function getParkingLocation() {
  navigator.geolocation.getCurrentPosition(
    getParkingLocationSuccess,
    locationError,
    { enableHighAccuracy: true }
  );
}

function getParkingLocationSuccess(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  parkedLatitude = storage.getItem("parkedLatitude");
  parkedLongitude = storage.getItem("parkedLongitude");
  showDirections();
}

function showDirections() {
  var dRenderer = new google.maps.DirectionsRenderer();
  var dService = new google.maps.DirectionsService();
  var curLatLong = new google.maps.LatLng(latitude, longitude);
  var parkedLatLong = new google.maps.LatLng(parkedLatitude, parkedLongitude);
  var map = new google.maps.Map(document.getElementById("map"));
  map.setZoom(16);
  map.setCenter(curLatLong);
  dRenderer.setMap(map);
  dService.route(
    {
      origin: curLatLong,
      destination: parkedLatLong,
      travelMode: "DRIVING",
    },
    function (response, status) {
      if (status == "OK") {
        dRenderer.setDirections(response);
        document.getElementById("directions").innerHTML = "";
        dRenderer.setPanel(document.getElementById("directions"));
      } else {
        navigator.notification.alert("Directions failed due to: " + status);
      }
    }
  );
  setCss("map", "visibility", "visible");
  setCss("directions", "visibility", "visible");
  setCss("instructions", "display", "none");
}
