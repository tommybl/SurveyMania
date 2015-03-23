
var googleAddress = {
    placeSearch: null,
    autocomplete: null,

    initialize: function () {
        googleAddress.autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('googleAddress-autocomplete')), { types: ['geocode'] });
        google.maps.event.addListener(googleAddress.autocomplete, 'place_changed', function() {
            googleAddress.fillInAddress();
        });
    },

    fillInAddress: function () {
        var place = googleAddress.autocomplete.getPlace();
        console.log(place);
        var val = place.address_components[0]['long_name'] + ', ' + place.address_components[1]['long_name'];
        document.getElementById('sign-route').value = val;
        val = place.address_components[2]['long_name'];
        document.getElementById('sign-town').value = val;
        val = place.address_components[5]['long_name'];
        document.getElementById('sign-country').value = val;
        val = place.address_components[6]['long_name'];
        document.getElementById('sign-postal').value = val;
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