/**
 * Created by ying on 2/3/16.
 */
var Spot = function(place, map){
    var self = this;
    self.name = place.name;
    self.phone = place.phone;
    self.rating = place.rating;
    self.address = place.location.address[0] + address[1];
    self.lat = place.location.coordinate.latitude;
    self.lon = place.location.coordinate.longitude;
    self.googleLocationObject = new google.maps.LatLng(lat, lon);

    self.marker = new google.maps.Marker({
        map: map,
        position: position,
        draggable: true,
        animation: google.maps.Animation.DROP,
    });
    self.infoWindow =  new google.maps.InfoWindow();
    google.maps.event.addListener(self.marker, 'click', function () {
        // bounce after click
        toggleBounce(marker);
        // close the previous window
        self.infoWindow.close();
        infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' +
            'Address: ' + place.location.address + '<br>' +
            'Phone: ' + place.phone + '<br>' +
            'rating: ' + place.rating + '<br>' +
            'comment: ' + place.snippet_text + '</div>');
        self.infoWindow.open(map, this);

    });
}
