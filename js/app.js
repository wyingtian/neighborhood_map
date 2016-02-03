var map;

function initMap() {
    var myLatlng = new google.maps.LatLng(40.7484, -73.9857);
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7484,
            lng: -73.9857
        },
        zoom: 15
    });
    // Specify location, radius and place types for your Places API search.
    var request = {
        location: myLatlng,
        radius: '500',
    };
}


function AppViewModel() {
    this.toBeSearched = ko.observable("Search here");
    this.businessList = ko.observableArray([]);
    this.search = ko.computed(function () {

    });


    function createMarker(infowindow, place) {
        var lat = place.location.coordinate.latitude;
        var lon = place.location.coordinate.longitude;
        var position = new google.maps.LatLng(lat, lon);
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            draggable: true,
            animation: google.maps.Animation.DROP,
        });

        google.maps.event.addListener(marker, 'click', function () {
            // bounce after click
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                // stop bounce after 2 seconds
                setTimeout(function () {
                    marker.setAnimation(null);
                }, 2000);
            }

            // close the previous window
            infowindow.close();
            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Address: ' + place.location.address + '<br>' +
                'Phone: ' + place.phone + '<br>' +
                'rating: ' + place.rating + '<br>' +
                'comment: ' + place.snippet_text + '</div>');
            infowindow.open(map, this);
        });
    }


    function getDataYelpAjax(zipcodeToSearch, keyWordToSearch) {
        /*
         * yelp API v2.0 token/secret
         */
        var auth = {
            consumerKey: "vVbyoRo4h1WxLAC25iI_Kw",
            consumerSecret: "olUvqmlNc3hOsXVLaiiKYm5XiBE",
            accessToken: "mbg1YR0bJkgrIzOlE6ENymOShBsQm6EV",
            accessTokenSecret: "F1vu2BP3qh6pIgxP-Wv0VcWpP90",
            serviceProvider: {
                signatureMethod: "HMAC-SHA1"
            }
        };

        /*
         *  Create a variable "accessor" to pass on to OAuth.SignatureMethod
         */
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };

        /*
         *  Create a array object "parameter" to pass on "message" JSON object
         */
        var parameters = [];
        parameters.push(['term', keyWordToSearch]);
        parameters.push(['location', zipcodeToSearch]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        /*
         *  Create a JSON object "message" to pass on to OAuth.setTimestampAndNonce
         */
        var message = {
            'action': 'http://api.yelp.com/v2/search',
            'method': 'GET',
            'parameters': parameters
        };

        /*
         *  OAuth proof-of-concept using JS
         */
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        /*
         *  OAuth proof-of-concept using JS
         */

        var parameterMap = OAuth.getParameterMap(message.parameters);
        var res;
        $.ajax({
            'url': message.action,
            'data': parameterMap,
            'dataType': 'jsonp',
            'global': true,
            'jsonpCallback': 'cb',
            'success': function (data) {
                res=data;
                // console.dir(data);
                generateItemList(data);
            }
        });
    }

    function generateItemList(jsonResponse) {
        // a list of array of business responded by yelp
        var businessArray = jsonResponse.businesses;
        var businessList = ko.observableArray([]);
        var businessesArrayLen = businessArray.length
        // pass in only one instance of infoWindow to the window
        // to make sure only one window displayed after click a few markers
        var infoWindow = new google.maps.InfoWindow();
        // for each business add to the list and add a marker on the map
        for (var i = 0; i < businessesArrayLen; i++) {
            $('#list-places').append("<li class=list-group-item id='list-places" + i + "'>" + businessArray[i].name + "<br>" + businessArray[i].location.address + '</li>');
            google.maps.event.addDomListener(window, 'load', createMarker(infoWindow, businessArray[i]));
            businessList.push(businessArray[i]);
        }
    }

    getDataYelpAjax(10118, "comic store");

}

ko.applyBindings(new AppViewModel());