document.getElementById('save').addEventListener('click', function() {
    var endUser = document.getElementById('endUser').value;
    var NEBULY_API_KEY = document.getElementById('NEBULY_API_KEY').value;
    chrome.storage.sync.set({endUser: endUser, NEBULY_API_KEY: NEBULY_API_KEY}, function() {
        console.log('User input values saved.');
    });
});