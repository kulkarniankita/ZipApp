(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var itemTemplate = element.querySelector(".itemtemplate");
            var listView = element.querySelector(".groupeditemslist").winControl;

            element.querySelector("header[role=banner] .pagetitle").textContent = Data.appName;

            listView.groupHeaderTemplate = element.querySelector(".headertemplate");

            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);

            this._initializeLayout(listView, appView.value, itemTemplate);
            listView.element.focus();
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            var itemTemplate = element.querySelector(".itemtemplate");
            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState, itemTemplate);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState, itemTemplate) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.itemTemplate = ZipGrid.template;
                listView.layout = new ui.ListLayout();
            } else {               
                listView.groupDataSource = Data.getHubItems.groups.dataSource;
                listView.itemTemplate = ZipGrid.template;
                listView.layout = new ui.GridLayout({ groupInfo: ZipGrid.layout, groupHeaderPosition: "top" });
                listView.itemDataSource = Data.getHubItems.dataSource;               
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = args.detail.itemPromise._value.data;
                switch (args.detail.itemPromise._value.data.type) {
                    case "tweet":
                        var uriToLaunch = item.url;
                        var uri = new Windows.Foundation.Uri(uriToLaunch);
                        Windows.System.Launcher.launchUriAsync(uri).then(
                           function (success) {
                               if (success) {
                                   // URI launched 
                               } else {
                                   // URI launch failed 
                               }
                           });
                        break
                    case "YouTube":                        
                        nav.navigate("/pages/videoDetail/videoDetail.html", { item: Data.getItemReference(item) });
                        break
                    default:                        
                        nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
                }
            }
        }
    });
})();
