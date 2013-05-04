var provider = {
    localFolder: Windows.Storage.ApplicationData.current.localFolder,
    defaultMaxHubItems: 8,
    getFileName: function (currentList) {
        var fileName = currentList.dataProvider + "-" + currentList.id + '.js';
        return fileName;
    },
    processItems: function (providerData, currentList, globalList, shouldSave, unshift) {
        var toSave = [];
        try{
            for (var x = 0; x < providerData.length; x++) {
                var item = providerData[x]
                item.group = currentList;
                var maxNumber = provider.defaultMaxHubItems;
                if (!isNaN(item.group.maxitems) && item.group.maxitems > 0) {
                    maxNumber = item.group.maxitems
                }
                item.showOnHub = x < maxNumber;
                item.title = item.title            

                unshift ? globalList.unshift(item) : globalList.push(item); 
                toSave.push(item);
            }

            if (shouldSave && toSave.length > 0) {
                var fileName = provider.getFileName(currentList);
                provider.saveFile(fileName, JSON.stringify(toSave));
            }
        }
        catch (e) {
            console.log("Processing Items Error", error);
            toSave = [];
        }
        return toSave.length;
    },

    process: function (lists, globalList) {
        for (var i = 0; i < lists.length; i++) {
            (function () {
                var currentList = lists[i];
                var fileName = provider.getFileName(currentList);
                provider.localFolder.getFileAsync(fileName)
                   .then(function (sampleFile) {
                       return Windows.Storage.FileIO.readTextAsync(sampleFile);
                   })
                   .done(function (contents) {
                       var providerData = JSON.parse(contents);
                      
                       if (currentList.dataProvider == "twitter") {
                           provider.doTwitterUpdate(currentList, globalList, null, null, function () { provider.processItems(providerData, currentList, globalList, false); });
                       }
                       else {
                           provider.processItems(providerData, currentList, globalList, false);
                       }
                       return;
                   }, function error() { return provider.fetchFromCache(fileName, currentList, globalList) })
            })();
        }
        return;
    },
    doTwitterUpdate: function (currentList, globalList, refresh_url, filename, fireOnError) {
        if (filename == null) {
            filename = provider.getFileName(currentList);
        }
        var unshift = refresh_url != null;
        if (refresh_url == null) {
            var user = currentList.param1;
            var search = currentList.param2;
            
            if (user) {
                user = " from:" + user;
            }
            refresh_url = "?q=" + search + user;
        }

        WinJS.xhr({
            url: "http://search.twitter.com/search.json" + refresh_url, responseType: 'json'
        })
            .done(function complete(result) {
                var formatted = provider.convertTwitterJson(result, currentList);
                var itemNumbers = provider.processItems(formatted, currentList, globalList, true, unshift);
                if (itemNumbers == 0) {
                    if (fireOnError != null) {
                        fireOnError();
                    }
                }
                else {
                    setTimeout(function () { provider.doTwitterUpdate(currentList, globalList, formatted.refresh_url, filename) }, 60000);
                }
                
            }, function (error) {
                console.error("Error trying to contact twitter", error);
                if (fireOnError != null) {
                    fireOnError();
                }
            })
    },
    fetchFromCache: function (fileName, currentList, globalList) {
        WinJS.xhr({ url: "/js/cache/" + fileName }).done(
            function (contents) {
                var providerData = JSON.parse(contents.responseText);
                provider.processItems(providerData, currentList, globalList, true);
            }
          , function (error) {
              console.error("Error fetching from cache?", error);
          })
    },
    convertTwitterJson: function convertTwitterJson(twitterJson, group) {
        var tweets = [];
        try {
        var cleanUp = twitterJson.responseText.replace(/\\'/g, "'");
        var providerData = JSON.parse(cleanUp);        
        tweets.refresh_url = providerData.refresh_url;
        for (var i = 0; i < providerData.results.length; i++) {
            var tweet = {};
            tweet.group = group;
            tweet.type = "tweet";
            tweet.title = providerData.results[i].from_user;
            tweet.subtitle = providerData.results[i].from_user_name;
            tweet.description = providerData.results[i].text;
            tweet.content = providerData.results[i].text;
            tweet.url = "https://twitter.com/" + providerData.results[i].from_user + "/status/" + providerData.results[i].id_str;
            // change _normal to _bigger to get a larger image from twitter
            tweet.backgroundImage = providerData.results[i].profile_image_url.replace('_normal', '_bigger');
            tweets.push(tweet);
        }
        }
        catch (e) {
            //catch and just suppress error
            console.error("Issues Parsing the JSON", e);
        }
        return tweets;
    },
    saveFile: function saveFile(fileName, content) {
        this.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
           .done(function (sampleFile) {
               return Windows.Storage.FileIO.writeTextAsync(sampleFile, content);
           }, (function (error) {
               console.error("Error in the saveFile", error);
           }));
    }
}