function updateList(ulId, list) {
    removeAllItems(ulId);
    addAllItems(ulId, list);
}
function removeAllItems(ulId) {
    var ul = document.getElementById(ulId);
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
}

function addAllItems(ulId, list) {
    var ul = document.getElementById(ulId);
    for (var i = 0; i < list.length; i++) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(list[i]));
        ul.appendChild(li);
    }
}

function removeItem(ulId, item, exact=false) {
    var ul = document.getElementById(ulId);

    for (var i = ul.children.length - 1; i >= 0; i--){
        //console.log(ul.children[i].textContent);
        if (!exact && ul.children[i].textContent.includes(item)) {
            ul.removeChild(ul.children[i]);
            console.log("Removed " + item + " from " + ulId);
            return;
        } else if (exact && ul.children[i].textContent === item) {
            ul.removeChild(ul.children[i]);
            console.log("Removed " + item + " from " + ulId);
            return;
        }
    }

    console.log("Could not remove " + item + " from " + ulId);
}

function addItem(ulId, item) {
    var ul = document.getElementById(ulId);
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(item));
    ul.appendChild(li);
    return li;
}

function getCurrentTime() {
    var now = new Date();

    var hours = now.getHours();
    var minutes = now.getMinutes();

    // Ensure that the hours and minutes are two digits
    //hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;

    var formattedTime = " (" + hours + ':' + minutes +")";
    return formattedTime;
}