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

var Business = function (infowindow, place) {
    var self = this;
    self.name = place.name;
    self.phone = place.phone;
    self.rating = place.rating;
    self.address =place.location.address + ", " + place.location.city;
    self.lat = place.location.coordinate.latitude;
    self.lon = place.location.coordinate.longitude;
    self.googleLocationObject = new google.maps.LatLng(self.lat, self.lon);
    self.comment = place.snippet_text;

    self.marker = new google.maps.Marker({
        map: map,
        position: self.googleLocationObject,
        infoWindow:new google.maps.InfoWindow(),
        //draggable: true,
        animation: google.maps.Animation.DROP,
    });

    //self.infoWindow = new google.maps.InfoWindow();
    self.marker.infoWindow.setContent('<div><strong>' + self.name + '</strong><br>' +
        'Address: ' + self.address + '<br>' +
        'Phone: ' + self.phone + '<br>' +
        'rating: ' + self.rating + '<br>' +
       //  'comment: ' + self.comment +
        '</div>');
    google.maps.event.addListener(self.marker, 'click', function () {

        // bounce after click
        toggleBounce(self.marker);
        // close the previous window
        //self.marker.infoWindow.close();
        self.marker.infoWindow.open(map, self.marker);
        lastMarkerClicked=self.marker;

    });
}

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
    self.toBeSearched = ko.observable("Search here");
    self.search = ko.computed(function () {

    });
    self.filter = ko.observable("");
    self.businessList = ko.observableArray([]);
    self.searchedItem = ko.observableArray([]);
    self.numBusinesses = ko.observable(0);

    self.clickAction =function(business){
        toggleBounce(business.marker);
        business.marker.infoWindow.open(map,business.marker);
    }
    getDataYelpAjax(10118, "comic store");
//ko.utils.arrayFilter - filter the items using the filter text
    self.searchedItem = ko.dependentObservable(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            for(var i = 0; i < self.businessList().length;i++){
                self.businessList()[i].marker.setVisible(true);
            }
            return self.businessList();
        } else {
            return ko.utils.arrayFilter(self.businessList(), function(item) {
                if(item.name.toLowerCase().indexOf(filter) === -1){
                    item.marker.setVisible(false);
                }else{
                    item.marker.setVisible(true);
                }
                //return ko.utils.stringStartsWith(item.toLowerCase(), filter);
                return item.name.toLowerCase().indexOf(filter) !== -1;
            });
        }
    }, AppViewModel);


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
            action: 'http://api.yelp.com/v2/search',
            method: 'GET',
            parameters: parameters
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
        var request = $.ajax({
            url: message.action +'d',
            data: parameterMap,
            dataType: 'jsonp',
            global:'true',
            error: function(xhr, textStatus, errorThrown) {
                //if (textStatus !== null) {
                //    alert("error: " + textStatus);
                //} else if (errorThrown !== null) {
                //    alert("exception: " + errorThrown.message);
                //}
                //else {
                    alert ("error");
                //}
            },
            success: function (data) {
                // console.dir(data);
                generateItemList(data);
            }

        });

    }

    function generateItemList(jsonResponse) {
        // a list of array of business responded by yelp
        var businessArray = jsonResponse.businesses;

        //self.businessList(businessArray);
        var businessesArrayLen = businessArray.length;
        // pass in only one instance of infoWindow to the window
        // to make sure only one window displayed after click a few markers
         var infoWindow = new google.maps.InfoWindow();
        // for each business add to the list and add a marker on the map
        for (var i = 0; i < businessesArrayLen; i++) {
            //$('#list-places').append("<li class=list-group-item id='list-places" + i + "'>" + businessArray[i].name + "<br>" + businessArray[i].location.address + '</li>');
           // console.log(businessArray[i].name);
            var theBusiness = new Business(infoWindow, businessArray[i]) ;
           // google.maps.event.addDomListener(window, 'load', Business(infoWindow, businessArray[i]));

            self.businessList.push(theBusiness);
            //self.businessListName.push(theBusiness.name);
        }

    }
}
ko.applyBindings(new AppViewModel());