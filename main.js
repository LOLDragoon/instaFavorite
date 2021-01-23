let data = {} // our default object when there is no one left to delete
const deletion = [] //array of usernames we need to remove from storage
const now = Date.now() // time upon loading an instagram page
let time = 30;
let scale = "seconds"
let active = true
let displayed = []
//short hand way to dynamically calculate for the proper unit
let timeConversionObj = {
  seconds: 1000,
  minutes:60000,
  hours:3600000,
  days:86400000,
}


function getSettings(){
  chrome.storage.sync.get({
    InstaFavoriteTime: 30,
    InstaFavoriteScale: "seconds",
    InstaFavoriteActive: true
  }, function(items) {
    time = items.InstaFavoriteTime;
    scale = items.InstaFavoriteScale;
    active = items.InstaFavoriteActive;
    console.log(time,scale,active)
  });
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
    for(const user in arr){
      //console.log(arr[user])
      delete data[arr[user]]
    }
    //console.log('data after deletion',data)
    chrome.storage.sync.set({'users': data}, function(){
    })
  }
}


//generates what is displayed on the lefthand tab as well as modify the displayed object
function generateList(){
  console.log(deletion)
  displayed = []
  let list = ''
  for (let i = 0; i<5; i++){
    console.log("we are generating the list from",deletion[i])
    if(deletion[i]){
    list += `<li class="userName">${deletion[i]}</li>`
    displayed.push(deletion[i])
    }
  }
  let remainder = deletion.length-displayed.length
  console.log("remainder", remainder)
  list += `<li class="userName"> and ${remainder} other(s)</li>`
  console.log(list)
  return list
}

// has to remove all users from storage so they don't show up on the other tabs
//update the sidebar with the new names
// THEN open up the other tabs

function openTabs(){
  let message = ''
  // made sure that our data object is cleaned
  for(let i=0; i<displayed.length; i++){
    message+= `${displayed[i]}\n`
    delete data[deletion.shift()]
  }
  navigator.clipboard.writeText(message)
  //console.log(data)
  //load that new data to storage and only upon completion do we start our loading spree
  chrome.storage.sync.set({'users': data}, function(){
    setTimeout(() => { 
      for(let i=0; i<displayed.length;i++){
        window.open(`https://instagram.com/${displayed[i]}`);
      }
      document.querySelector(".userList").innerHTML= generateList();
    },0)
  })

}

function closeSidebar() {
  document.getElementById("mySideBar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}



//acquire settings from options
getSettings()

// check if we have anyone to unfollow

chrome.storage.sync.get(['users'], function(result){
  console.log("result", result)
  if(result.users){
  data = result.users
  //console.log("this is data",data)
    for (const user in data) {
      //individually parses the package of each object to compare if the proper amount of time has passed
      if(Math.floor((now-data[user].date)/timeConversionObj[data[user].magnitude])>=data[user].amount){
       // console.log(`${user} is older than ${data[user].amount}, time to delete!`)
        deletion.push(user)
        //console.log(deletion)
      }
    }
    if(deletion.length>0){
      document.querySelector(".userList").innerHTML= generateList()
      document.getElementById("mySideBar").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      //generateConfirmation(message,deletion)
    }
  }
  //console.log(data)
})



// dom injection junk
let sidebar= document.createElement("div")
sidebar.id = "mySideBar"
sidebar.className = "sidebar"

sidebar.innerHTML = `
<a href="javascript:void(0)" class="closebtn">&times;</a>
<div class="choppingBlock">
  <div class="instructions">Click "Purge" to copy to clipboard the names currently displayed as well as open tab to their homepage\n</div>
  <ul class ="userList">
  <li class="userName">test</li>
  </ul>
  <button class="purgeButton">Purge</button>
</div>
<br>
<div class="instructions">You can see the full list of your followed users from the options page</div>`
 let body = document.getElementsByTagName("body")
 body[0].prepend(sidebar)


document.querySelector(".purgeButton").addEventListener("click",openTabs)
document.querySelector(".closebtn").addEventListener("click",closeSidebar)


document.addEventListener('mousedown',function(e){
  // console.log("className",e.target.className) // seems like instagram has a consistent naming schema for their follow div
  // console.log("first child",e.target.firstChild.nodeValue) // double redundancy to ensure we actually hit that follow button
  let className = e.target.className
  let regEx = /sqdOP*/
  if(e.target.firstChild.nodeValue === "Follow" && className.match() && active === true){
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
  let refreshSettings = false;
  for (let key in changes) {
    if (key === "InstaFavoriteActive" || key === "InstaFavoriteScale" || key === "InstaFavoriteTime"){
      refreshSettings = true;
    }
    let storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
  if (refreshSettings){
    getSettings()
    refreshSettings = false
  }
});