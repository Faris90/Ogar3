module.exports = function (multiverse, split) {
  
  
 if (split[1] == "list") {
   console.log("[Console] Listing servers...")
  var servers = multiverse.getServers();
  a = 0;
  for (var i in servers) {
    if (!servers[i]) continue;
    a++
    var extra = "] ";
    if (servers[i].name == multiverse.getSelected().name) extra = extra + " (Selected) ";
    if (servers[i].isMaster) extra = extra + " (Master) ";
    var port = (servers[i].port) ? servers[i].port : "Default";
    var gmd = (servers[i].gamemode) ? servers[i].gamemode : " Default "
    console.log("[Console] " + a + ". " + servers[i].name + " [Port: " + port + ", Gmd: " + gmd +  ", Title: " + servers[i].title + extra); 

    
  }
   
 } else if (split[1] == "create") {
   var port = parseInt(split[3]);
   
  var title = split.slice(5, split.length).join(' ');
   if (!split[2]) {
     console.log("[Console] Please specify a name");
     return;
   }
   if (isNaN(port)) {
     console.log("[Console] Please specify a port");
     return;
   }
   var gamemode = "default";
   if (parseInt(split[4])) gamemode = split[4];
   
   if (!multiverse.create(split[2],false,port, parseInt(split[4]),title)) console.log("[Console] That name/port is already taken!"); else 
   console.log("[Console] Created server " + split[2] + " on port " + port + " on gamemode " + gamemode + " With a title of " + title);
   
 } else if (split[1] == "remove") {
   if (!split[2]) {
     console.log("[Console] Please specify a server name");
     return;
   }
 if (!multiverse.remove(split[2])) console.log("[Console] Failed to remove server. Check it is not master or selected");
   else console.log("[Console] Removed server " + split[2]);
 } else if (split[1] == "select") {
   if (!split[2]) {
     console.log("[Console] Please specify a server name");
     return;
   }
    if (multiverse.setSelected(split[2]))
  console.log("[Console] You are now controlling server " + split[2]); 
  else
  console.log("[Console] That server doesnt exist!");
 } else {
   console.log("[Console] Please specify a command! (list, select,remove,create)");
 }
  
  
}
