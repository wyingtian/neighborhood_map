var map;
// initialize google map, initial center is Empire state building in New York
function initMap() {
    var myLatlng = new google.maps.LatLng(40.7484, -73.9857);
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7484,
            lng: -73.9857
        },
        zoom: 15
    });

    var request = {
        location: myLatlng,
        radius: '500',
    };
}

// Business is an business object defined based on ajax input
// it has also contains a marker object,
// parameter 'place' is a jason object returned by yelp api
var Business = function (place) {
    var self = this;
    self.name = place.name;
    self.phone = place.phone;
    self.rating = place.rating;
    self.address =place.location.address + ", " + place.location.city;
    self.lat = place.location.coordinate.latitude;
    self.lon = place.location.coordinate.longitude;
    self.googleLocationObject = new google.maps.LatLng(self.lat, self.lon);
    self.comment = place.snippet_text;
    // infoWindow lives within the marker
    self.marker = new google.maps.Marker({
        map: map,
        position: self.googleLocationObject,
        infoWindow:new google.maps.InfoWindow(),
        animation: google.maps.Animation.DROP,
    });
    // set infoWindow content
    self.marker.infoWindow.setContent('<div><strong>' + self.name + '</strong><br>' +
        'Address: ' + self.address + '<br>' +
        'Phone: ' + self.phone + '<br>' +
        'rating: ' + self.rating + '<br>' +
        '</div>');
    //when click on the marker, marker bounce and show info window
    google.maps.event.addListener(self.marker, 'click', function () {
        // bounce after click
        toggleBounce(self.marker);
        self.marker.infoWindow.open(map, self.marker);
    });
};

// the function to make a marker bounce and show info window
function toggleBounce(marker){
    // bounce after click
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // stop bounce after 2 seconds
        setTimeout(function () {
            marker.setAnimation(null);
        }, 2000);
        setTimeout(function () {
            marker.infoWindow.close();
        }, 4000);
    }
}


function AppViewModel() {
    var self = this;
    // filter is bound to the input box to be searched
    self.filter = ko.observable("");
    // businessList is bound to all the objects found by yelp api
    self.businessList = ko.observableArray([]);
    // searchedItem is bound to the objects filtered by key words
    self.searchedItem = ko.observableArray([]);
    // when a button in the list being clicked, this method gets called
    // bound to <button id="list-place">
    self.clickAction =function(business){
        toggleBounce(business.marker);
        business.marker.infoWindow.open(map,business.marker);
    };
    //ko.utils.arrayFilter - filter the items using the filter text
    //filter the items based on input text
    self.searchedItem = ko.dependentObservable(function() {
        var filter = self.filter().toLowerCase();
        return ko.utils.arrayFilter(self.businessList(), function(item) {
            // set found items marker visibility to true, not found ones to false
            if(item.name.toLowerCase().indexOf(filter) === -1){
                item.marker.setVisible(false);
            }else{
                item.marker.setVisible(true);
            }
            return item.name.toLowerCase().indexOf(filter) !== -1;
        });
    
    }, AppViewModel);

    // the function to make the yelp api request
    // reference: http://stackoverflow.com/questions/13149211/yelp-api-google-app-script-oauth
    function getDataYelpAjax(zipcodeToSearch, keyWordToSearch) {
        // keys obtained from yelp
        var auth = {
            consumerKey: "vVbyoRo4h1WxLAC25iI_Kw",
            consumerSecret: "olUvqmlNc3hOsXVLaiiKYm5XiBE",
            accessToken: "mbg1YR0bJkgrIzOlE6ENymOShBsQm6EV",
            accessTokenSecret: "F1vu2BP3qh6pIgxP-Wv0VcWpP90",
            serviceProvider: {
                signatureMethod: "HMAC-SHA1"
            }
        };
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };
        //   parameter array to pass on "message" JSON object
        var parameters = [];
        parameters.push(['term', keyWordToSearch]);
        parameters.push(['location', zipcodeToSearch]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);


        var message = {
            action: 'http://api.yelp.com/v2/search',
            method: 'GET',
            parameters: parameters
        };
        //Oauth js
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        var parameterMap = OAuth.getParameterMap(message.parameters);
        $.ajax({
            url: message.action,
            data: parameterMap,
            dataType: 'jsonp',
            global:'true',
            timeout:4000,
            // error message shown when request failed
            error: function(xhr, textStatus, errorThrown) {
                    alert ("Yelp Ajax request failed");
            },
            success: function (data) {
                // call the generateItemList function to parse the json data
                generateItemList(data);
            }
        });
    }
    //parse json data
    function generateItemList(jsonResponse) {
        // a list of array of business responded by yelp
        var businessArray = jsonResponse.businesses;
        var businessesArrayLen = businessArray.length;
        // for each json business create a business instance
        for (var i = 0; i < businessesArrayLen; i++) {
            var theBusiness = new Business( businessArray[i]) ;
            self.businessList.push(theBusiness);
        }
    }

    // call the yelp api
    getDataYelpAjax(10118, "comic store");
}
ko.applyBindings(new AppViewModel());