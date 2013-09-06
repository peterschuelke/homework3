app.controller("mainController", function($scope, $http){
    //Add the api key from trakt
    $scope.apiKey ="f31c2ed2f8c4b1d3d2894d9a48b78422";
    // init vars
    $scope.results = [];
    $scope.filterText = null;
    // create our scope method
    $scope.init = function() {
      //API requires a start date
        var today = new Date();
        //Create the date string and ensure leading zeros if required
        var apiDate = today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) + "" + ("0" + today.getDate()).slice(-2);
        $http.jsonp('http://api.trakt.tv/calendar/premieres.json/' + $scope.apiKey + '/' + apiDate + '/' + 30 + '/?callback=JSON_CALLBACK').success(function(data) {
            //As we are getting our data from an external source, we need to format the data so we can use it to our desired effect
            //For each day, get all the episodes
            angular.forEach(data, function(value, index){
                //The API stores the full date separately from each episode. Save it so we can use it later
                var date = value.date;
                //For each episodes, add it to the results array
                angular.forEach(value.episodes, function(tvshow, index){
                    //Create a date string from the timestamp so we can filter on it based on user text input // We already have a date string, the issue is that the API response doesn't attach dates to each episode, so we are doing that ourselves.
                    tvshow.date = date; //Attach the full date to each episode
                    $scope.results.push(tvshow);
                    //Loop through each genre for this episode
                    angular.forEach(tvshow.show.genres, function(genre, index){
                        //Only add to the availableGenres array if it doesn't already exist
                        var exists = false;
                        angular.forEach($scope.availableGenres, function(avGenre, index){
                            if (avGenre == genre) {
                                exists = true;
                            }
                        });
                        if (exists === false) {
                            // add the genre to the array for the filter dropdown
                            $scope.availableGenres.push(genre);
                        }
                    });
                });
            });
        }).error(function(error) {
          //if the ajax returns an error
        });
    };
    //collect the genre filter and apply to out $scope object
    $scope.setGenreFilter = function(genre) {
        $scope.genreFilter = genre;
    }
    //reorder the shows based on applied order
    $scope.customOrder = function(tvshow) {
        switch ($scope.orderField) {
            case "Air Date":
                return tvshow.episode.first_aired;
                break;
            case "Rating":
                return tvshow.episode.ratings.percentage;
                break;
        }
    };
    // adds the drop down fields to the selects
    $scope.orderFields = ["Air Date", "Rating"];
    $scope.orderDirections = ["Descending", "Ascending"];
    $scope.orderField = "Air Date"; //Default order field
    $scope.orderReverse = false;
});

//this is our genre filter
app.filter('isGenre', function() {
    return function(input, genre) {
        if (typeof genre == 'undefined' || genre == null) {
            return input;
        } else {
            var out = [];
            //loop over the selected genres
            for (var a = 0; a < input.length; a++){
              //loop over the shows
                for (var b = 0; b < input[a].show.genres.length; b++){
                  //check if the show genre matches
                    if(input[a].show.genres[b] == genre) {
                      //add the show to the array for display
                        out.push(input[a]);
                    }
                }
            }
            return out;
        }
    };
});
