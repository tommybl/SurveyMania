var googleAddress = {
    placeSearch: null,
    autocomplete: null,
    divId: "googleAddress",
    components: ["street_number", "route", "locality", "country", "postal_code"]
};

var googleAddress2 = {
    placeSearch: null,
    autocomplete: null,
    divId: "googleAddress2",
    components: ["street_number", "route", "locality", "country", "postal_code"]
};

function googleInitialize() {
    googleAddress.autocomplete = new google.maps.places.Autocomplete((document.getElementById('googleAddress-autocomplete')), { types: ['geocode'] });
    googleAddress2.autocomplete = new google.maps.places.Autocomplete((document.getElementById('googleAddressAccount-autocomplete')), { types: ['geocode'] });
    google.maps.event.addListener(googleAddress.autocomplete, 'place_changed', function() {fillInAddress(googleAddress);});
    google.maps.event.addListener(googleAddress2.autocomplete, 'place_changed', function() {fillInAddress(googleAddress2);});
}

function fillInAddress($googleAddr) {
    console.log($googleAddr);
    var place = $googleAddr.autocomplete.getPlace();
    var num = "", route = "", postal = "", locality = "", sublocality = "", country = "";
    console.log(place);

    for (var i = 0; i < place.address_components.length; i++) {
        for (var k = 0; k < place.address_components[i].types.length; k++) {
            if (num == "" && place.address_components[i].types[k] == "street_number")
                num = place.address_components[i]['long_name'] + ', ';
            else if (route == "" && place.address_components[i].types[k] == "route")
                route = place.address_components[i]['long_name'];
            else if (postal == "" && place.address_components[i].types[k] == "postal_code")
                postal = place.address_components[i]['long_name'];
            else if (locality == "" && place.address_components[i].types[k] == "locality")
                locality = place.address_components[i]['long_name'];
            else if (sublocality == "" && place.address_components[i].types[k] == "sublocality")
                sublocality = place.address_components[i]['long_name'];
            else if (country == "" && place.address_components[i].types[k] == "country")
                country = place.address_components[i]['long_name'];
        }
    }

    var scope = angular.element(document.getElementById($googleAddr.divId+'sign-route')).scope();
    // Provisoire
    if($googleAddr.divId == "googleAddress")
    {
        scope.user.address = num + route;
        scope.user.postal = postal;
        scope.user.country = country;
        if (locality == "") scope.user.town = sublocality;
        else scope.user.town = locality;
    }
    else if($googleAddr.divId == "googleAddress2")
    {
        scope.user.owner_adress = num + route;
        scope.user.owner_postal = postal;
        scope.user.owner_country = country;
        if (locality == "") scope.user.owner_town = sublocality;
        else scope.user.owner_town = locality;
    }
    scope.$apply();
}

function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            googleAddress.autocomplete.setBounds(circle.getBounds());
        });
    }
}