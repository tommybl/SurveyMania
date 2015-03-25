var googleAddress = {
    placeSearch: null,
    autocomplete: null,
    components: ["street_number", "route", "locality", "country", "postal_code"],

    initialize: function () {
        googleAddress.autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('googleAddress-autocomplete')), { types: ['geocode'] });
        google.maps.event.addListener(googleAddress.autocomplete, 'place_changed', function() {
            googleAddress.fillInAddress();
        });
    },

    fillInAddress: function () {
        var place = googleAddress.autocomplete.getPlace();
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

        var scope = angular.element(document.getElementById('sign-route')).scope();
        scope.user.address = num + route;
        scope.user.postal = postal;
        scope.user.country = country;
        if (locality == "") scope.user.town = sublocality;
        else scope.user.town = locality;
        scope.$apply();
    },

    geolocate: function () {
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
}