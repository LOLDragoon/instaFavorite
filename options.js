function save_options() {
  let time = document.getElementById('time').value;
  let scale = document.getElementById('scale').value;
  let active = document.getElementById('active').checked;
  chrome.storage.sync.set({
    InstaFavoriteTime: time,
    InstaFavoriteScale: scale,
    InstaFavoriteActive: active
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    InstaFavoriteTime: 60,
    InstaFavoriteScale: "days",
    InstaFavoriteActive: true
  }, function(items) {
    document.getElementById('time').value = items.InstaFavoriteTime;
    document.getElementById('scale').value = items.InstaFavoriteScale;
    document.getElementById('active').checked = items.InstaFavoriteActive;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);