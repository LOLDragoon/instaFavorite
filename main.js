let data = {} // our default object when there is no one left to delete
let timer = 30 // our global variable for how long we need to wait, ideally this will be in storage and editable in the future
const deletion = [] //array of usernames we need to remove from storage
const now = Date.now() // time upon loading an instagram page
let time = 30;
let scale = "seconds"
let timeConversionObj = {
  seconds: 1000,
  minutes:60000,
  hours:3600000,
  days:86400000,
}


function generateMessage(arr){
  let listMessage = 'Users due for unfollowing:\n'
  for(const user in arr){
    listMessage+= `${user}\n`
  }
  listMessage+= `copy and paste these names and click OK to clear, click "Remind Me Later" to be reminded later`
  return listMessage
}

function generateConfirmation(message,arr)
{
  fullMessage = "The following users are due to be unfollowed: \n\n" + message +`\n Click 'OK' to copy names to clipboard for unfollowing,
  click 'Cancel' to keep the users and be reminded later`
  if(confirm(fullMessage)){
    console.log("deleted")
    navigator.clipboard.writeText(message)
    for(const user in arr){
      //console.log(arr[user])
      delete data[arr[user]]
    }
    //console.log('data after deletion',data)
    chrome.storage.sync.set({'users': data}, function(){
    })
  }
}


chrome.storage.sync.get(['users'], function(result){
  console.log("result", result)
  if(result.users){
  let message = ''
  data = result.users
    for (const user in data) {
      if(Math.floor((now-data[user].date)/timeConversionObj[data[user].magnitude])>=data[user].amount){ //refine for days or minutes or some sort of toggle
        console.log(`${user} is older than ${data[user].amount}, time to delete!`)
        deletion.push(user)
        message+= `${user}\n`
        console.log(deletion)
      }
    }
    if(deletion.length>0){
      generateConfirmation(message,deletion)
    }
  }
  //console.log(data)
})


document.addEventListener('mousedown',function(e){
  // console.log("className",e.target.className) // seems like instagram has a consistent naming schema for their follow div
  // console.log("first child",e.target.firstChild.nodeValue) // double redundancy to ensure we actually hit that follow button
  let className = e.target.className
  let regEx = /sqdOP*/
  if(e.target.firstChild.nodeValue === "Follow" && className.match()){
    console.log("you pressed the follow button")
    console.log("header",e.target.closest('header'))
    console.log("closest anchor",e.target.closest('header').querySelector('a').getAttribute("href"))
    // chrome.storage.sync.set({'test': "1"}, function() {
    // });
    // chrome.storage.sync.set({'test': "2"}, function() {
    // });
    // chrome.storage.sync.get(['test'], function (result){
    //   console.log("Test is ", result.test)
    // })
    username = e.target.closest('header').querySelector('a').getAttribute("href").slice(1,-1)
    console.log(username)
    data[username] = {date:Date.now(),
                      magnitude: scale,
                      amount: time}
    console.log(data)
    chrome.storage.sync.set({'users': data}, function(){
    })
  }
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});