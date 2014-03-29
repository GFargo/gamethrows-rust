function On_ServerInit(){
   Plugin.CreateTimer("SecUpdate", 1000).Start();
}

function On_PlayerConnected(Player){
   Data.AddTableValue("PlayerLoaded", Player.SteamID, 0);
}

function SecUpdateCallback(){
   for(var Player in Server.Players){
      if (Data.GetTableValue("PlayerLoaded", Player.SteamID) == 0){
         if (Player.X != 0 || Player.Y != 0 || Player.Z != 0){
               Data.AddTableValue("PlayerLoaded", Player.SteamID, 1);
               OnPlayerLoaded(Player);
         }
      }
   }
}

function OnPlayerLoaded(Player){
   Player.Message("Howdy Ho " + Player.Name + "! Welcome to the Game of Throws" );
   //Use it! ;)
}