(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
            element.querySelector("article .item-title").textContent = item.title;
            element.querySelector("article .item-subtitle").textContent = item.subtitle;

            var img = element.querySelector("article .item-image");

            img.onerror = function () {
                img.src = "images/noimage.png";
            }

            if (item.hideimage) {
                img.style.display = "none";
            }
            
            img.src = item.backgroundImage;
            img.alt = item.subtitle;
            element.querySelector("article .item-content").innerHTML = toStaticHTML(item.content);
            element.querySelector(".content").focus();
        }
    });
})();
