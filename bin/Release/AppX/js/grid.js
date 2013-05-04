var ZipGrid = {
    layout : function () {
        return {
            enableCellSpanning: true,
            cellWidth: 150,
            cellHeight: 70,
        };
    },
    template: function (itemPromise) {
        return itemPromise.then(function (currentItem) {
            var content;
            var result;
            var theSwitch;
            if (currentItem.data.type == null || Windows.UI.ViewManagement.ApplicationView.value == Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                theSwitch = "snapped";
            }
            else {
                theSwitch = currentItem.data.type.toLowerCase();
            }

            switch (theSwitch) {
                case "tweet":
                    {
                        var bigTweet = currentItem.data.content && currentItem.data.content.length > 80;
                        content = document.getElementsByClassName(bigTweet ? "template310x150" : "template310x70")[0];
                        result = content.cloneNode(true);
                        result.className = bigTweet ? "template310x150" : "template310x70";
                        result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.subtitle;
                        result.getElementsByClassName("item-content")[0].textContent = currentItem.data.content;
                        break;
                    }
                case "snapped":
                    {
                        content = document.getElementsByClassName("template310x70")[0];
                        result = content.cloneNode(true);
                        result.className = "template310x70";
                        //result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.subtitle;
                        result.getElementsByClassName("item-content")[0].textContent = currentItem.data.subtitle;
                        break;
                    }
                case "articlefeature":
                    content = document.getElementsByClassName("template310x310-image")[0];
                    result = content.cloneNode(true);
                    result.className = "template310x310-image";
                    result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.subtitle;
                    break;
                case "articlesmall":
                    content = document.getElementsByClassName("template150x150-image")[0];
                    result = content.cloneNode(true);
                    result.className = "template150x150-image";
                    result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.subtitle;
                    break;
                default:
                    {
                        content = document.getElementsByClassName("template310x150-image")[0];
                        result = content.cloneNode(true);
                        result.className = "template310x150-image";
                        result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.subtitle;
                    }
            }

            // Because we used a WinJS template, we need to strip off some attributes 
            // for it to render.
            result.attributes.removeNamedItem("data-win-control");
            result.attributes.removeNamedItem("style");
            result.style.overflow = "hidden";

            // Because we're doing the rendering, we need to put the data into the item.
            // We can't use databinding.
            var img = result.getElementsByClassName("item-image")[0];
            img.src = currentItem.data.backgroundImage;
            img.onerror = function () {
                img.src = "images/noimage.png";
            }
            img.onload = function (event) {
                var containerWidth = img.width;
                var containerHeight = img.height;
                var naturalWidth = img.naturalWidth;
                var naturalHeight = img.naturalHeight;

                var wr = (containerWidth - naturalWidth)
                var wpercent = (wr / naturalWidth);

                var hr = (containerHeight - naturalHeight)
                var hpercent = (hr / naturalHeight);

                var percentIncrease = Math.max(hpercent, wpercent);

                var newWidth = naturalWidth + (naturalWidth * percentIncrease);
                var newHeight = naturalHeight + (naturalHeight * percentIncrease);

                var tmiddleOfNewImage = newHeight / 2;
                var lHmiddleOfNewImage = newWidth / 2;

                var t = Math.round(tmiddleOfNewImage - (containerHeight / 2));
                var b = Math.round(t + containerHeight);
                var l = Math.round(lHmiddleOfNewImage - (containerWidth / 2));
                var r = Math.round(l + containerWidth);

                var top = t;
                var right = r;
                var bottom = b;
                var left = l;
                img.width = newWidth;
                img.height = newHeight;
                img.style.width = newWidth + "px";
                img.style.height = newHeight + "px";
                img.style.position = "absolute";

                img.style.clip = "rect(" + top + "px " + right + "px " + bottom + "px " + left + "px)";
                img.style.left = -Math.abs(l) + "px";
                img.style.top = -Math.abs(t) + "px";
            }
            result.getElementsByClassName("item-title")[0].textContent = currentItem.data.title;
            return result;
        });
    }
}