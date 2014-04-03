/*
   __    _        __  ___  ___           ___           __  ___  __________  ___    __  __    
  /__\  /_\    /\ \ \/   \/___\/\/\     / __\/\ /\  /\ \ \/ __\/__   \_   \/___\/\ \ \/ _\   
 / \// //_\\  /  \/ / /\ //  //    \   / _\ / / \ \/  \/ / /     / /\// /\//  //  \/ /\ \    
/ _  \/  _  \/ /\  / /_// \_// /\/\ \ / /   \ \_/ / /\  / /___  / //\/ /_/ \_// /\  / _\ \   
\/ \_/\_/ \_/\_\ \/___,'\___/\/    \/ \/     \___/\_\ \/\____/  \/ \____/\___/\_\ \/  \__/ 

*/

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

function getArraySize(array)
{
  var size = 0;
  for (var i in array)
  {
    size++;
  }
  return size;
}

/* 
   _      ___         _____    __     ___           __  ___  __________  ___    __  __    
  /_\    /   \/\/\    \_   \/\ \ \   / __\/\ /\  /\ \ \/ __\/__   \_   \/___\/\ \ \/ _\   
 //_\\  / /\ /    \    / /\/  \/ /  / _\ / / \ \/  \/ / /     / /\// /\//  //  \/ /\ \    
/  _  \/ /_// /\/\ \/\/ /_/ /\  /  / /   \ \_/ / /\  / /___  / //\/ /_/ \_// /\  / _\ \   
\_/ \_/___,'\/    \/\____/\_\ \/   \/     \___/\_\ \/\____/  \/ \____/\___/\_\ \/  \__/   

 */

//Mike  76561197983542681
//Charlie  76561197986685988
//OD  76561197974340167
//Sean 76561198073472773 
//Griffen 76561197989153725
function Admin_Auth(SteamID, superFlag, mikeFlag, Player) {
   //Util.ConsoleLog('First Step');
  if (superFlag == true && mikeFlag == true) {
    //Super Admins
    var AdminArray = ["76561197983542681", "76561197989153725"];
  } else if (superFlag == true) {
      var AdminArray = ["76561197983542681","76561197986685988","76561197974340167", "76561197989153725"];
      
   } else {
    //Admins
    var AdminArray = ["76561197983542681","76561197986685988","76561197974340167", "76561197989153725", "76561197961690794", "76561198073472773"];
  }
  
  for (var i=0; i < AdminArray.length; i++)
  { 
    if (SteamID == AdminArray[i]) {
      return true;  
    }
  }
  return false;
}

function Admin_WolfAttack(Player, cmd, args) {
  if (Admin_Auth(Player.SteamID, true) == true) {
          if (getArraySize(args) > 1) {
            var finalSearchName = "";
            for (var i=0; i < getArraySize(args); i++)
        { 
          finalSearchName = finalSearchName + ' ' + args[i];
        }
        var victim = Magma.Player.FindByName(finalSearchName); // Still not finding
          } else {
            var victim = Player.Find(args[0]);
          }
            Player.Notice('The wolves are going after ' + victim.Name);

            //var victim = Player.Find(args[0]);
           
            var locOne = victim.Location;
      var locTwo = victim.Location;
      var locThree = victim.Location;
      var locFour = victim.Location;

      locOne.x = locOne.x + 5;
      locTwo.x = locTwo.x - 5;
      locThree.z = locThree.z + 5;
      locFour.z = locFour.z - 5;


      World.Spawn(":wolf_prefab", locOne);
      World.Spawn(":wolf_prefab", locTwo);
      World.Spawn(":wolf_prefab", locThree);
      World.Spawn(":wolf_prefab", locFour);

      victim.Notice('The wolves have been called on you.');
  } else {
      Player.Notice('You do not have access to /wolfattack');
  } 
}





function Admin_GoTo(Player, cmd, args) {
  if (Admin_Auth(Player.SteamID) == true) {
       var targetName = Get_Name(Player, args);
       Player.Message('TargetName:', targetName);
        if (Get_Name(Player, args) == false) {
               Player.Notice('Player not found.');
        } else {
               if (targetName == Player.Name) {
                   Player.Notice('You can not /goto yourself');
               } else {
                  Player.Message('Target Name: "' + targetName + '"');
                  var target = Magma.Player.FindByName(targetName); // Still not finding
                  var pos = target.Location;
                  Player.TeleportTo(pos.x, pos.y, pos.z);
               }
         }
   
    } else {
      Player.Notice('You do not have access to /goto');
  }   
}


function Admin_Home(Player, cmd, args) {
  if (Admin_Auth(Player.SteamID) == true) {
      switch (args[0])
     {
             case "outside":
                     Player.TeleportTo('6675', '344', '-4425');
                     Player.Notice('You are now outside your home!');
                     break;

               case "roof":
                     Player.TeleportTo('6686', '356', '-4420');
                     Player.Notice('You are now home!');
                     break;  
               case "jail":
                     Player.TeleportTo('6409', '452', '-4476');
                     break;
   }
     } else {
      Player.Notice('You do not have access to /home');
  }   
}

function Get_Name(Player, args) {
   if (getArraySize(args) > 1) {
            var finalSearchName = "";
            for (var i=0; i < getArraySize(args); i++)
            { 
               finalSearchName = finalSearchName + ' ' + args[i];
            }
            Player.Message('The Name: "' + finalSearchName + '"');
            var potentialName = Magma.Player.FindByName(finalSearchName); // Still not finding
            Player.Message('Found 1? ' + potentialName.Name);
            if (potentialName.Name.length > 0) {
               return potentialName.Name;
            } else {
               return false;
            }
    } else {
            var potentialName = Magma.Player.FindByName(args[0]);
            Player.Message('Found 2? ' + potentialName.Name);
            if (potentialName.Name.length > 0) {
               return potentialName.Name;
            } else {
               return false;
            }
    }
}

function Admin_FollowBuddy(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true) == true) 
   {
      var buddyName = Get_Name(Player, args);
        if (Get_Name(Player, args) == false) {
            Player.Notice('Player not found.');
        } else {
         if (buddyName == Player.Name) {
           Player.Notice('You can not follow yourself');
         } else {
           Player.Message(buddyName + ' is now your buddy. Use /where to find his general direction');
         }

        }
      
   }


   //DataStore.Add("jailed_time", target.SteamID, System.Environment.TickCount);
}


function Admin_Jump(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true) == true) {
         var pos = Player.Location;
         switch (args[0])
         {
                  case "u":
                        Player.TeleportTo(pos.x, pos.y + 5, pos.z);                     
                        break;
                  case "d":
                         Player.TeleportTo(pos.x, pos.y - 5, pos.z);                      
                        break; 
                  case "l":
                        Player.TeleportTo(pos.x - 5, pos.y, pos.z);
                        break;
                  case "r":
                        Player.TeleportTo(pos.x + 5, pos.y, pos.z);
                        break;
                  case "f":
                        Player.TeleportTo(pos.x, pos.y, pos.z + 5);
                        break;
                  case "b":
                        Player.TeleportTo(pos.x, pos.y, pos.z - 5);
                        break;
                  default:
                        Player.TeleportTo(pos.x, pos.y + 5, pos.z);
                        break;
         }
   } else {
      Player.Notice('You do not have access to /jump');
   }
}

function Admin_Jail(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true, true) == true) {
               var target = Magma.Player.FindByName(args[0]);
               
               
               if (target.Name.length > 0) {
                     Player.Notice('You Jailed ' + target.Name);
                     target.Notice('You have been jailed by ' + Player.Name + '.');
                     DataStore.Add("jailed_time", target.SteamID, System.Environment.TickCount);
                                 DataStore.Add("jailed_x", target.SteamID, target.Location.x);
                                 DataStore.Add("jailed_y", target.SteamID, target.Location.y);
                                 DataStore.Add("jailed_z", target.SteamID, target.Location.z);
                     if (getArraySize(args) > 1) {
                           if (args[1] == 'large') {
                                 
                                 target.TeleportTo('6409', '452', '-4476');
                           } else {
                               //Plugin.CreateTimer("userJailed-" + target.SteamID,10000).Start();
                                 DataStore.Add("jailed_time", target.SteamID, System.Environment.TickCount);
                                 target.TeleportTo('6410', '445', '-4477');
                           } 
                     } else {
                            DataStore.Add("jailed_time", target.SteamID, System.Environment.TickCount);
                            target.TeleportTo('6410', '445', '-4477');
                     }                  
               } else {
                  Player.Notice('Player not found.');
               }
   }
}

function Admin_SaveState(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID) == true) {
      Player.Notice('Saving state.');
      DataStore.Remove("saveStateX", Player.SteamID);
      DataStore.Remove("saveStateY", Player.SteamID);
      DataStore.Remove("saveStateZ", Player.SteamID);
      DataStore.Add("saveStateX", Player.SteamID, Player.Location.x);
      DataStore.Add("saveStateY", Player.SteamID, Player.Location.y);
      DataStore.Add("saveStateZ", Player.SteamID, Player.Location.z);
      DataStore.Get("saveStateZ", Player.SteamID);
      DataStore.Remove("jailed_time", target.SteamID);
   }
}

function Admin_LoadState(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID) == true) {
      Player.Notice('Loading state.');
      var loadStateX = DataStore.Get("saveStateX", Player.SteamID);
      var loadStateY = DataStore.Get("saveStateY", Player.SteamID);
      var loadStateZ = DataStore.Get("saveStateZ", Player.SteamID);

      

      Player.TeleportTo(loadStateX, loadStateY, loadStateZ);
   }
}

function Admin_ClearStates(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true, true) == true) {
         Player.Notice('You have cleared the states datastore.');
         DataStore.Flush("saveStateX");
         DataStore.Flush("saveStateY");
         DataStore.Flush("saveStateZ");
         
   }
}



function Admin_UnJail(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true, true) == true) {
              var target = Magma.Player.FindByName(args[0]);
              var time = DataStore.Get("jailed_time", target.SteamID);
              var targetx = DataStore.Get("jailed_x", target.SteamID);
              var targety = DataStore.Get("jailed_y", target.SteamID);
              var targetz = DataStore.Get("jailed_z", target.SteamID);
              var minutes = (System.Environment.TickCount - time) / 60000;
              Player.Notice('He was jailed for: ' + minutes + ' minutes.');
              target.Notice('Admin has released you.');
              target.Message('You were jailed for ' + minutes + ' minutes.');
              //Player.Message('Returning him to.. X: ' +  + ' Y: ' +  + ' Z: ' + )
              target.TeleportTo(targetx, targety, targetz);
              DataStore.Remove("jailed_time", target.SteamID);
              DataStore.Remove("jailed_x", target.SteamID);
              DataStore.Remove("jailed_y", target.SteamID);
              DataStore.Remove("jailed_z", target.SteamID);
   }
}

function Admin_ClearJail(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true, true) == true) {
         Player.Notice('You have cleared the jail datastore.');
         DataStore.Flush("jailed_time");
         DataStore.Flush("jailed_x");
         DataStore.Flush("jailed_y");
         DataStore.Flush("jailed_z");
         
   }
}


function Admin_Force(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID, true) == true) {
         Player.Message('1: ' + getArraySize(args));
         if (getArraySize(args) > 2) {
            Player.Message('1.5');
            //var FinalName = Test_Names(args);
            var FinalName = "";
            for (var i=0; i < 2; i++)
            { 
               Player.Message('Test_Names[' + i + ']');
               FinalName = FinalName + ' ' + args[i];
            }

            Player.Message('1.6: ' + FinalName);
            var target = Magma.Player.FindByName(FinalName); // Still not finding
            Player.Message('1.7: ');
            target.SendCommand(args[2]);
          } else {
            Player.Message('2');
            var target = Magma.Player.FindByName(args[0]);
            target.SendCommand(args[1]);
          }
      } else {
         Player.Notice('You do not have access to /force');
   }  
}




function Admin_NameChange(Player, cmd, args) {


}

function Admin_DisplayAdmins(Player, cmd, args) {

}

function Admin_TestKit(Player, cmd, args) {
  if (Admin_Auth(Player.SteamID, true, true) == true) {
    Player.Notice('You have been given a test kit.');
    //Player.Inventory.AddItem('Wood Shelter', '1');
    //Player.Inventory.AddItem('Wood Door', '1');
    Player.Inventory.AddItem('Wood', '2000');
    Player.Inventory.AddItem('Stone Hatchet', '1');
    Player.Inventory.AddItem('Cooked Chicken Breast', '3');
  }
}

function Admin_SetLocation(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID) == true) {
      //Player.Message('args: ' + args[0]);
      Player.Message('Location saved: "' + args[0] + '"');
      DataStore.Add("savedlocations", Player.SteamID + '-' + args[0], Player.Location);
     //DataStore.Remove("jailed_time", target.SteamID);
     //DataStore.Get("saveStateY", Player.SteamID);
   }
}
function Admin_GoToLocation(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID) == true) {
      var pos = DataStore.Get("savedlocations", Player.SteamID + '-' + args[0]);
      Player.TeleportTo(pos.x, pos.y, pos.z);
   }
}

function Admin_GoToPosition(Player, cmd, args) {
   if (Admin_Auth(Player.SteamID) == true) {
      Player.TeleportTo(args[0], args[1], args[2]);
      //Player.Message(args[0] + ' ' + args[1]  + ' ' +  args[2]);
   }
}
/* 4991 462 -3011
   ___    __        ___           __  ___  __________  ___    __  __    
  /___\/\ \ \      / __\/\ /\  /\ \ \/ __\/__   \_   \/___\/\ \ \/ _\   
 //  //  \/ /     / _\ / / \ \/  \/ / /     / /\// /\//  //  \/ /\ \    
/ \_// /\  /     / /   \ \_/ / /\  / /___  / //\/ /_/ \_// /\  / _\ \   
\___/\_\ \/____  \/     \___/\_\ \/\____/  \/ \____/\___/\_\ \/  \__/   
         |_____|                                                        

*/

function On_Command(Player, cmd, args)
{ 
    switch (cmd)
          {
                  case "wolfattack":
                      Admin_WolfAttack(Player, cmd, args);
                          break;

                  case "home":
                      Admin_Home(Player, cmd, args);
                      break;  
                  case "goto":
                      Admin_GoTo(Player, cmd, args);
                      break;
                     case "force":
                           Admin_Force(Player, cmd, args);
                           break;
                     case "jump":
                           Admin_Jump(Player, cmd, args);
                           break;
                      case "jail":
                           Admin_Jail(Player, cmd, args);
                           break;
                      case "unjail":
                           Admin_UnJail(Player, cmd, args);
                           break;
                      case "clearjail":
                           Admin_ClearJail(Player, cmd, args);
                           break;
                      case "test":
                           Player.Message('trying to test');
                           break;
                      case "savestate":
                           Admin_SaveState(Player, cmd, args);
                           break;            
                      case "loadstate": 
                           Admin_LoadState(Player, cmd, args);
                           break;     
                      case "clearstates":
                           Admin_ClearStates(Player, cmd, args);
                           break;
                      case "admins":
                           Admin_DisplayAdmins(Player, cmd, args);
                           break;
                      case "follow":
                           Admin_FollowBuddy(Player, cmd, args);
                           break;
                      case "testkit":
                           Admin_TestKit(Player, cmd, args);
                           break;
                      case "setloc":
                           Admin_SetLocation(Player, cmd, args);
                           break;
                      case "gotoloc":
                           Admin_GoToLocation(Player, cmd, args);
                           break;
                      case "pos":
                           Admin_GoToPosition(Player, cmd, args);
                           break;
          }
}

function On_DoorUse(Player, DoorEvent) {
   if (Admin_Auth(Player.SteamID, true, true) == true) {
      Player.Message('[' + DoorEvent.Entity.Owner.Name + '] Door Opened.');
      DoorEvent.Open = true;
      return;
   }
}

function On_EntityDecay(DecayEvent) {
   if (Admin_Auth(HurtEvent.Victim.SteamID, true) == true) {
      DecayEvent.Entity.Owner.Message('Item is decaying: ' + DecayEvent.Entity.Name);
   }

   //DecayEvent.DamageAmount
   
}

function On_PlayerHurt(HurtEvent, Ent) {
  if (Admin_Auth(HurtEvent.Victim.SteamID, true, true) == true) {
    HurtEvent.DamageAmount = 0; // Godmode
    HurtEvent.Victim.IsInjured = false; // No Broken Legs
    HurtEvent.Victim.IsBleeding = false; // Not Bleeding
    if (HurtEvent.Victim.Name == HurtEvent.Attacker.Name) {
    } else {
      HurtEvent.Victim.Message('You were attacked by ' + HurtEvent.Attacker.Name);
    }
    
    HurtEvent.Attacker('Leave nTel alone. He is writing our server plugins.');
  } 
}


function On_EntityHurt(HurtEvent) {
  if (Admin_Auth(HurtEvent.Attacker.SteamID, true, true) == true) {
  

    HurtEvent.DamageAmount = 0;
    if (Admin_Auth(HurtEvent.Entity.Owner.SteamID, true, true) == true) { //Quick Fix for message spamming due to decay most likely.
      
    } else {
        HurtEvent.Attacker.Message('Name:' + HurtEvent.Entity.Name + 'ID: ' + HurtEvent.Entity.InstanceID + ' | HP: ' +  HurtEvent.Entity.Health + ' | ' + HurtEvent.Entity.Owner.Name);
    }
  //  if (DataStore.Get("jail_item", HurtEvent.Entity.InstanceID) == 'true') {
  //    HurtEvent.Attacker.Message('Already Added This Item');
  //  } else {
  //    DataStore.Add("jail_item", HurtEvent.Entity.InstanceID, 'true');
  //    HurtEvent.Attacker.Message('Item Added to jail_item!');
  //  }
        //DataStore.Get("saveStateZ", Player.SteamID);
        //DataStore.Remove("jailed_time", target.SteamID);
    if (DataStore.Get("jail_item", HurtEvent.Entity.InstanceID) == 'true') {
    HurtEvent.DamageAmount = 0;
    //HurtEvent.Attacker.Notice('You can not destroy the jail. Sorry!');
  }
    //HurtEvent.Entity.UpdateHealth(HurtEvent.Entity.Health - 100);
    //HurtEvent.Attacker.Message('You are attacking ' + HurtEvent.Entity.Name + ' [' + HurtEvent.Entity.Health + '] for ' + HurtEvent.DamageAmount + ' damage.');
    //var goingToDie = HurtEvent.Entity.Health - HurtEvent.DamageAmount;
    //if (goingToDie < 1) {
    //  HurtEvent.DamageAmount = 0;
    //  HurtEvent.Attacker.Notice('You would have killed this Entity.');
    //}

    //HurtEvent.DamageAmount = 0;
  } else {
      if (HurtEvent.Entity.Owner.Name) {
        
      } else {
         HurtEvent.DamageAmount = 0;
         HurtEvent.Attacker.Message('You can not raid while the owner is offline.');
      }

    if (DataStore.Get("jail_item", HurtEvent.Entity.InstanceID) == 'true') {
    HurtEvent.DamageAmount = 0;
    HurtEvent.Attacker.Notice('You can not destroy the jail. Sorry!');
  }
  }

  
}


//JAIL

// -392846
// -392696  
//
//
//
//
//
//
//

//function On_EntityHurt(HurtEv) 
//{
//  if(HurtEv.Attacker != null && HurtEv.Entity != null)
//  {
//    var player = HurtEv.Attacker;
//    var entity = HurtEv.Entity;
//
//    player.Message(player.SteamID);
//    player.Message(entity.Name);
//    player.Message(entity.OwnerID);
//  }
//}

function On_EntityDeployed(Player, Entity) {
  //Datastore.Add('entity_owner', Entity.InstanceID, Entity.Owner.SteamID);
}

function On_Console(Player, Arg, Third)
{

}

function On_Chat(Player, Chat){
        
}  

function On_ServerInit(){
   //Plugin.CreateTimer("SecUpdate", 1000).Start();
}

function On_PlayerConnected(Player){
   //Data.AddTableValue("PlayerLoaded", Player.SteamID, 0);
}

function OnPlayerLoaded(Player){
   Player.Message("Howdy Ho " + Player.Name + "! Welcome to the Game of Throws" );
   if (Admin_Auth(Player.SteamID, true) == true) {
      Player.Message('Admin in the house.');
         Player.SendCommand('rcon.login birdcat');
   }
}


/*
function On_PlayerGathering(Player, ge) {
  var percentage = parseInt(ge.PercentFull * 100);
  Player.Message(percentage + "%");
}
*/