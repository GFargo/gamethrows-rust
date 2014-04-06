PLUGIN.Title = "Flag Zone"
PLUGIN.Description = "Create zones and assign flags to them"
PLUGIN.Version = "0.1.7"
PLUGIN.Author = "greyhawk"

function PLUGIN:LoadDefaultConfig()
    self.Config.PPSM = 100 -- Price per Square Meter
    self.Config.ZoneBottomToTop = true
    self.Config.UserCanCreateZones = false
    self.Config.UserCanChangePVP = false
end

function PLUGIN:Init()
    print("Flag Zone plugin loading.")
    
    flags_plugin = plugins.Find("flags")
    if (not flags_plugin) then
        print("You do not have the Flags plugin installed! Check here: http://forum.rustoxide.com/resources/flags.155/")
    end
    
    local b, res = config.Read( "flagzone" )
    self.Config = res or {}
        if (not b) then
            self:LoadDefaultConfig()
        if (res) then config.Save( "flagzone" ) end
    end
    self.PPSM = self.Config.PPSM
    self.ZoneBottomToTop = self.Config.ZoneBottomToTop
    self.UserCanCreateZones = self.Config.UserCanCreateZones
    self.UserCanChangePVP = self.Config.UserCanChangePVP
    
    
	self.DataFile = util.GetDatafile( "flagzone_users" )
	local txt = self.DataFile:GetText()
	if (txt ~= "") then
		self.Data = json.decode( txt )
	else
		self.Data = {}
	end
    
    self.ZoneFile = util.GetDatafile( "flagzone2" )
	local txt2 = self.ZoneFile:GetText()
	if (txt2 ~= "") then
		self.Zones = json.decode( txt2 )
	else
		self.Zones = {}
	end
    
    self.Count = 1
    for _,value in pairs(self.Zones) do
        self.Count = self.Count + 1
    end

    self:AddChatCommand("fzc", self.cmdFZC)
    self:AddChatCommand("fz1", self.cmdFZ1)
    self:AddChatCommand("fz2", self.cmdFZ2)
    self:AddChatCommand("fzone", self.cmdFZone)
    
    self:AddChatCommand("fzhelp", self.cmdFZHelp)
end

function PLUGIN:flagged(netuser, flag)
    return ( (netuser:CanAdmin())
          or ( flags_plugin and flags_plugin:HasFlag(rust.GetUserID(netuser), flag) ) )
end

function PLUGIN:cmdFZ1( netuser, cmd, args )
    local coords = netuser.playerClient.lastKnownPosition
    
    local location = self:whereZone(coords, self.Zones, "You are")
    if (location == "You are") then
        rust.SendChatToUser( netuser,  "You are not in a Zone")
    else
        rust.SendChatToUser( netuser,  location)
    end
    
    local data = self:GetUserData( netuser )
    local cc = {}
    cc.x = coords.x
    cc.y = coords.y
    cc.z = coords.z
    data.Sel1 = cc
    self:Save()
    
    if (data.Sel1 and data.Sel2) then
        local unit,result = self:calculateArea(data.Sel1, data.Sel2)
        rust.SendChatToUser( netuser, "Selected area: " .. tostring(math.ceil(result)) .. " " .. unit )
    end
    
    rust.SendChatToUser( netuser, "Position " .. self:printCoord(coords) )
end

function PLUGIN:cmdFZ2( netuser, cmd, args )
    local coords = netuser.playerClient.lastKnownPosition
    
    local location = self:whereZone(coords, self.Zones, "You are")
    if (location == "You are") then
        rust.SendChatToUser( netuser,  "You are not in a Zone")
    else
        rust.SendChatToUser( netuser,  location)
    end
    
    local data = self:GetUserData( netuser )
    local cc = {}
    cc.x = coords.x
    cc.y = coords.y
    cc.z = coords.z
    data.Sel2 = cc
    self:Save()
    
    if (data.Sel1 and data.Sel2) then
        local unit,result = self:calculateArea(data.Sel1, data.Sel2)
        rust.SendChatToUser( netuser, "Selected area: " .. tostring(math.ceil(result)) .. " " .. unit )
    end
    
    rust.SendChatToUser( netuser, "Position " .. self:printCoord(coords) )
end

-- /fzone
-- /fzone list
-- /fzone name
-- /fzone create rect name [price forsale]
-- /fzone create sphere name radius [price forsale]
-- /fzone edit name corner1
-- /fzone edit name owner name
-- /fzone edit name coowner add name
-- /fzone edit name coowner remove name
-- /fzone edit name option name value
-- /fzone edit name resize x 10
-- /fzone edit name resize y 10
-- /fzone edit name resize z 10
function PLUGIN:cmdFZone( netuser, cmd, args )
    local userID = rust.GetUserID( netuser )
    local data = self:GetUserData( netuser )
    local zone = nil
    local coords = netuser.playerClient.lastKnownPosition

    if (not args[1]) then
        zone = self:isZone(coords, self.Zones, nil)
        if (zone) then
            self:printZoneInfo(netuser, zone)
        else
            rust.Notice( netuser, "You are not in a zone")
        end
        return
    end -- PRINT ZONE INFO
    
    if (args[1] and (args[1] == "list") and not args[2]) then
        rust.SendChatToUser( netuser, "Zones owned or co-owned:")
        self:OwnedZones(netuser, userID, self.Zones)
        return
    end -- END LIST OWNED/CO-OWNED ZONES
    
    if (args[1] and not args[2]) then
        zone = self:findZone(args[1], self.Zones)
        if (zone) then
            self:printZoneInfo(netuser, zone)
        else
            rust.Notice( netuser, "This Zone does not exist!")
        end
        return
    end -- PRINT ZONE INFO
    
    -- /fzone create rect name [price forsale]
    if ( (args[1] == "create") and args[2] and (args[2] == "rect") ) then
        if (not data.Sel1) then
            rust.Notice( netuser,  "Missing Selected Corner 1, use /fz1 to select it")
            return
        end
        if (not data.Sel2) then
            rust.Notice( netuser,  "Missing Selected Corner 2, use /fz2 to select it")
            return
        end
        
        local location = self:whereZone(data.Sel1, self.Zones, "Corner 1 is")
        if (location ~= "Corner 1 is") then
            zone = self:isZone(data.Sel1, self.Zones, nil)
            rust.SendChatToUser( netuser, location)
            if (zone and not self:isOwner(userID, zone)) then
                rust.Notice( netuser, "You don't own this Zone!")
                return
            end
        else
            rust.SendChatToUser( netuser, "Corner 1 is not in a Zone")
        end
        
        location = self:whereZone(data.Sel2, self.Zones, "Corner 2 is")
        if (location ~= "Corner 2 is") then
            zone = self:isZone(data.Sel2, self.Zones, nil)
            rust.SendChatToUser( netuser, location)
            if (zone and not self:isOwner(userID, zone)) then
                rust.Notice( netuser, "You don't own this Zone!")
                return
            end
        else
            rust.SendChatToUser( netuser, "Corner 2 is not in a Zone")
        end
        
        -- add check other 6 corners
        
    end -- END CREATE RECT ERROR CHECKING
    
    -- /fzone create rect name [price forsale]
    if ( (args[1] == "create") and args[2] and (args[2] == "rect") ) then
        if (not(self:flagged(netuser, "createzone") or self.UserCanCreateZones)) then
            rust.Notice( netuser, "You're not allowed to create Zones!" )
            return
        end
        if (args[3]) then
            local name = args[3]
        
            local price = 0
            local forsale = false
            if (args[4]) then
                price = tonumber(args[4])
                if (args[5]) then
                    forsale = (args[5] == "forsale")
                end
            end
            local zone = self:createZoneRect(name, data.Sel1, data.Sel2, userID, price, forsale)
            self:addZone(zone, self.Zones, nil)
            data.Sel1 = nil
            data.Sel2 = nil
            self:Save()
            self:printZoneInfo(netuser, zone)
            return
        end
        rust.Notice( netuser, "No name for the Zone to create!")
        return
    end -- END CREATE RECT
    
    -- /fzone create sphere name radius [price forsale]
    if ( (args[1] == "create") and args[2] and (args[2] == "sphere") ) then
        local location = self:whereZone(coords, self.Zones, "Center is")
        if (location ~= "Center is") then
            zone = self:isZone(coords, self.Zones, nil)
            rust.SendChatToUser( netuser, location)
            if (zone and not self:isOwner(userID, zone)) then
                rust.Notice( netuser, "You don't own this Zone!")
                return
            end
        else
            rust.SendChatToUser( netuser, "Center is not in a Zone")
        end
        
        -- add check distance to other zones
        
    end -- END CREATE SPHERE ERROR CHECKING
    
    -- /fzone create sphere name radius [price forsale]
    if ( (args[1] == "create") and args[2] and (args[2] == "sphere") ) then
        if (not(self:flagged(netuser, "createzone") or self.UserCanCreateZones)) then
            rust.Notice( netuser, "You're not allowed to create Zones!" )
            return
        end
        if (args[3] and args[4]) then
            local name = args[3]
            local center = {}
            center.x = coords.x
            center.y = coords.y
            center.z = coords.z
            local radius = tonumber(args[4])
            local price = 0
            local forsale = false
            if (args[5]) then
                price = tonumber(args[5])
                if (args[6]) then
                    forsale = (args[6] == "forsale")
                end
            end
            local zone = self:createZoneSphere(name, center, radius, userID, price, forsale)
            self:addZone(zone, self.Zones, nil)
            data.Sel1 = nil
            data.Sel2 = nil
            self:Save()
            self:printZoneInfo(netuser, zone)
            return
        end
        rust.Notice( netuser, "No name for the Zone to create!")
        return
    end -- END CREATE SPHERE
    
    -- /fzone edit
    if (args[1] == "edit") then
    
        if (args[2] and args[3]) then
            local name = args[2]
            local zone = self:findZone(name, self.Zones)
            if (not zone) then
                rust.Notice( netuser, "This Zone does not exist!")
                return
            end
            if ( (not self:isOwner(userID, zone)) and (not self:flagged(netuser, "admin")) ) then
                rust.Notice( netuser, "You don't own this zone!")
                return
            end
            
            -- /fzone edit name option name value
            if (args[3] == "option") then
                if (args[4] and args[5]) then
                    if ((not self:flagged(netuser, "admin")) and (not self.UserCanChangePVP)) then
                        rust.Notice( netuser, "You're not allowed to change PvP!" )
                        return
                    end
                    self:setZoneOption(zone, args[4], args[5])
                    rust.SendChatToUser( netuser, "Zone Option " .. args[4] .. ":" .. tostring(zone.Options[args[4]]) .. " (modified)" )
                else
                    rust.Notice( netuser, "Specify an option to edit!")
                end
                return
            end
            
            -- /fzone edit name owner name
            if (args[3] == "owner") then
                if (args[4]) then
                    local newowner = self:GetUserDataFromName(args[4])
                    if (newowner) then
                        zone.OwnerID = newowner.ID
                        rust.SendChatToUser( netuser, "Zone Owner:" .. newowner.Name .. " (modified)" )
                    else
                        rust.Notice( netuser, "New owner not found!")
                    end
                else
                    rust.Notice( netuser, "Specify a new owner!")
                end
                return
            end
            
            
            return
        end
        rust.Notice( netuser, "Specify something to edit!")
        return
    end
    
end

function PLUGIN:cmdFZC( netuser, cmd, args )
    local coords = netuser.playerClient.lastKnownPosition
    rust.SendChatToUser( netuser, "Position " .. self:printCoord(coords) )
    local location = self:whereZone(coords, self.Zones, "You are")
    if (location == "You are") then
        rust.SendChatToUser( netuser,  "You are not in a Zone")
    else
        rust.SendChatToUser( netuser,  location)
    end
    
    local data = self:GetUserData( netuser )
    if (data.Sel1 and data.Sel2) then
        local unit,result = self:calculateArea(data.Sel1, data.Sel2)
        rust.SendChatToUser( netuser, "Selected area: " .. tostring(math.ceil(result)) .. " " .. unit )
    end
    
end


function PLUGIN:ModifyDamage( takedamage, damage )
    local atk = damage.attacker
    if (atk) then
        local client = atk.client
        if (client) then
            local netuser = client.netUser
            if (netuser) then
                local coords = netuser.playerClient.lastKnownPosition
                local zone = self:isZone(coords, self.Zones, nil)
                if (zone) then
                    -- rust.SendChatToUser( netuser, "Damage Zone: " .. zone.Name )
                end
                if (zone and (zone.Options.PvP ~= nil ) and (zone.Options.PvP == "false")) then
                    damage.amount = 0.0
                    -- local tkdmg = tostring(takedamage)
                    -- local dmg = tostring(damage)
                    -- print("TakeDamage: " .. tkdmg)
                    -- print("Damage" .. dmg)
                end
            end
        end
    end
    local vic = damage.victim
    if (vic) then
        local client = vic.client
        if (client) then
            local netuser = client.netUser
            if (netuser) then
                local coords = netuser.playerClient.lastKnownPosition
                local zone = self:isZone(coords, self.Zones, nil)
                if (zone) then
                    -- rust.SendChatToUser( netuser, "Damage Zone: " .. zone.Name )
                end
                if (zone and (zone.Options.PvP ~= nil ) and (zone.Options.PvP == "false")) then
                    damage.amount = 0.0
                    -- local tkdmg = tostring(takedamage)
                    -- local dmg = tostring(damage)
                    -- print("TakeDamage: " .. tkdmg)
                    -- print("Damage" .. dmg)
                end
                
            end
        end
    end
    return damage
end

-- ZoneList starts as self.Zones
function PLUGIN:findZone(name, ZoneList)
    for _,value in pairs(ZoneList) do
        if (name == value.Name) then
            return value
        end
        local subz = self:findZone(name, value.SubZones)
        if (subz ~= nil) then
            return subz
        end
    end
    return nil
end

-- ZoneList starts as self.Zones
function PLUGIN:OwnedZones(netuser, ID, ZoneList)
    for _,value in pairs(ZoneList) do
        local owned = false
        if (ID == value.OwnerID) then
            owned = true
            local unit,result = self:calculateZone(value)
            rust.SendChatToUser( netuser, "Own Zone " .. value.Name .. ", size: " .. tostring(math.ceil(result)) .. " " .. unit)
        end
        for _,value2 in pairs(value.CoOwnersID) do
            if (ID == value2) then
                owned = true
                local unit,result = self:calculateZone(value)
                rust.SendChatToUser( netuser, "Own Zone " .. value.Name .. ", size: " .. tostring(math.ceil(result)) .. " " .. unit)
            end
        end
        if (not owned) then
            self:OwnedZones(netuser, ID, value.SubZones)
        end
    end
end

function PLUGIN:isOwner(ID, zone)
    if (ID == zone.OwnerID) then return true end
    for _,value in pairs(zone.CoOwnersID) do
        if (ID == value) then return true end
    end
    return false
end

function PLUGIN:calculateZone(zone)
    local res = 0
    if (zone.Type == "rect") then
        if (self.ZoneBottomToTop) then
            res = math.ceil(math.abs( (zone.Corner1.x - zone.Corner2.x) * (zone.Corner1.z - zone.Corner2.z) ))
            return "m2", res
        else
            res = math.ceil(math.abs( (zone.Corner1.x - zone.Corner2.x) * (zone.Corner1.y - zone.Corner2.y) * (zone.Corner1.z - zone.Corner2.z) ))
            return "m3", res
        end
    elseif (zone.Type == "sphere") then
        if (self.ZoneBottomToTop) then
            res = math.ceil(math.abs( zone.Radius * zone.Radius * 3.14159 ))
            return "m2", res
        else
            res = math.ceil(math.abs( zone.Radius * zone.Radius * zone.Radius * 3.14159 * 4 / 3 ))
            return "m3", res
        end
    end
end

function PLUGIN:calculateArea(sel1, sel2)
    local res = 0
    if (self.ZoneBottomToTop) then
        res = math.ceil(math.abs( (sel1.x - sel2.x) * (sel1.z - sel2.z) ))
        return "m2", res
    else
        res = math.ceil(math.abs( (sel1.x - sel2.x) * (sel1.y - sel2.y) * (sel1.z - sel2.z) ))
        return "m3", res
    end
end

-- ZoneList starts as self.Zones
-- zone starts with nil
function PLUGIN:isZone(coords, ZoneList, zone)
    for _,value in pairs(ZoneList) do
        if (self:isInZone(value, coords)) then
            local subz = self:isZone(coords, value.SubZones, value)
            if (subz ~= nil) then
                return subz
            else
                return value
            end
        end
    end
    return zone
end

-- ZoneList starts as self.Zones
-- location starts as "You are "
function PLUGIN:whereZone(coords, ZoneList, location)
    for _,value in pairs(ZoneList) do
        if (self:isInZone(value, coords)) then
            local owner = self:GetUserDataFromID(value.OwnerID)
            local name = "no one"
            if (owner) then
                name = owner.Name
            end
            return self:whereZone(coords, value.SubZones, location .. " in Zone " .. value.Name .. " owned by " .. name )
        end
    end
    return location
end

-- ZoneList starts as self.Zones
-- parent starts as nil
function PLUGIN:addZone(zone, ZoneList, parent)
    for _,value in pairs(ZoneList) do
        if (zone.Type == "rect") then
            if (self:isInZone(value, zone.Corner1) and self:isInZone(value, zone.Corner2)) then
                self:addZone(zone, value.SubZones, value)
                return
            end
        elseif (zone.Type == "sphere") then
            if (self:isInZone(value, zone.Center)) then
                self:addZone(zone, value.SubZones, value)
                return
            end
        end
    end
    local index = #ZoneList + 1
    zone.ID = index
    
    if (parent) then
        zone.Parent = parent.ID
        zone.CoOwnersID = parent.CoOwnersID
        zone.Options = parent.Options
    else
        zone.Parent = 0
    end
    ZoneList[index] = zone
    self:SaveZones()
end

function PLUGIN:createZoneSphere(name, center, radius, ownerID, price, forsale)
    local new = {}
    new.ID = 0
    new.Name = name
    new.Type = "sphere"
    new.Center = center
    new.Radius = radius
    new.OwnerID = ownerID
    new.CoOwnersID = {}
    new.Options = {}
    new.SubZones = {}
    new.Parent = 0
    new.Price = price
    new.ForSale = forsale
    return new
end

function PLUGIN:createZoneRect(name, corner1, corner2, ownerID, price, forsale)
    local new = {}
    new.ID = 0
    new.Name = name
    new.Type = "rect"
    new.Corner1 = corner1
    new.Corner2 = corner2
    new.OwnerID = ownerID
    new.CoOwnersID = {}
    new.Options = {}
    new.SubZones = {}
    new.Parent = 0
    new.Price = price
    new.ForSale = forsale
    return new
end

function PLUGIN:printZoneInfo(netuser, zone)
    if (zone) then
        local data = self:GetUserDataFromID(zone.OwnerID)
        local unit,result = self:calculateZone(zone)
        rust.SendChatToUser( netuser, "-----------------------------------------------")
        rust.SendChatToUser( netuser, "Zone Name: " .. zone.Name .. "  Type: " .. zone.Type .. "  Size:" .. result .. " " .. unit )
        rust.SendChatToUser( netuser, "Owner: " .. data.Name)
        
        local coowners = ""
        local count = 0
        for _,value in pairs(zone.CoOwnersID) do
            local coownerdata = self:GetUserDataFromID(zone.OwnerID)
            coowners = coowners .. coownerdata.Name
            count = count + 1
        end
        rust.SendChatToUser( netuser, "Co-Owners(" .. count .. "): " .. coowners)
        
        rust.SendChatToUser( netuser, "Options:" )
        for key,value in pairs(zone.Options) do
            rust.SendChatToUser( netuser, "- " .. key .. " : " .. tostring(value) )
        end
        
        local subzones = ""
        count = 0
        for _,value in pairs(zone.SubZones) do
            subzones = subzones .. value.Name .. ", "
            count = count + 1
        end
        rust.SendChatToUser( netuser, "SubZones(" .. count .. "): " .. subzones)
        rust.SendChatToUser( netuser, "-----------------------------------------------")
    end
end

-- PVP: on/off
function PLUGIN:setZoneOption(zone, name, option)
    zone.Options[name] = option
    for _,value in pairs(zone.SubZones) do
        self:setZoneOption(value, name, option)
    end
    self:SaveZones()
end

function PLUGIN:isInZone(zone, coords)
    if (zone.Type == "rect") then
        local ordX = (zone.Corner1.x < zone.Corner2.x)
        local ordY = (zone.Corner1.y < zone.Corner2.y)
        local ordZ = (zone.Corner1.z < zone.Corner2.z)

        local x
        if (ordX) then
            x = ( (coords.x >= zone.Corner1.x) and (coords.x <= zone.Corner2.x) )
        else
            x = ( (coords.x >= zone.Corner2.x) and (coords.x <= zone.Corner1.x) )
        end
        if (not x) then return false end

        local y = true
        if (self.ZoneBottomToTop == false) then
            if (ordY) then
                y = ( (coords.y >= zone.Corner1.y) and (coords.y <= zone.Corner2.y) )
            else
                y = ( (coords.y >= zone.Corner2.y) and (coords.y <= zone.Corner1.y) )
            end
            if (not y) then return false end
        end
        
        local z
        if (ordZ) then
            z = ( (coords.z >= zone.Corner1.z) and (coords.z <= zone.Corner2.z) )
        else
            z = ( (coords.z >= zone.Corner2.z) and (coords.z <= zone.Corner1.z) )
        end
        if (not z) then return false end
        
        return true
    elseif (zone.Type == "sphere") then
        local dist = (zone.Center.x - coords.x) * (zone.Center.x - coords.x)
        dist = dist + (zone.Center.z - coords.z) * (zone.Center.z - coords.z)
        if (self.ZoneBottomToTop == false) then
            dist = dist + (zone.Center.y - coords.y) * (zone.Center.y - coords.y)
        end
        dist = math.sqrt(dist)
        return (dist <= zone.Radius)
    end
end

function PLUGIN:printCoord(coord)
    return ( "x " .. tostring(math.ceil(coord.x)) .. "  y " .. tostring(math.ceil(coord.y)) .. "  z " .. tostring(math.ceil(coord.z)) )
end

function PLUGIN:cmdFZHelp( netuser )
    rust.SendChatToUser( netuser, "----------------- Greyhawk's Flag Zone Plugin -----------------------" )
	rust.SendChatToUser( netuser, "Use /fzc to show your coordinates" )
    rust.SendChatToUser( netuser, "Use /fzone to show your zone" )
    rust.SendChatToUser( netuser, "Use /fzone to list zones you own or co-own" )
end

function PLUGIN:SendHelpText( netuser )
    rust.SendChatToUser( netuser, "Use /fzhelp to see Flag Zone commands" )
end

function PLUGIN:OnUserConnect( netuser )
    local data = self:GetUserData( netuser )
end

function PLUGIN:Save()
	self.DataFile:SetText( json.encode( self.Data ) )
	self.DataFile:Save()
end

function PLUGIN:SaveZones()
	self.ZoneFile:SetText( json.encode( self.Zones ) )
	self.ZoneFile:Save()
end

function PLUGIN:GetUserData( netuser )
	local userID = rust.GetUserID( netuser )
	return self:GetUserDataFromID( userID, netuser.displayName )
end

function PLUGIN:GetUserDataFromID( userID, name )
	local userentry = self.Data[ userID ]
	if (not userentry) then
		userentry = {}
		userentry.ID = userID
		userentry.Name = name
        userentry.Sel1 = nil
        userentry.Sel2 = nil
		self.Data[ userID ] = userentry
        self:Save()
	elseif (name and name ~= "") then
        userentry.Name = name
    end
	return userentry
end

function PLUGIN:GetUserDataFromName(name)
    for key,value in pairs(self.Data) do
        if (value.Name == name) then
            return value
        end
    end
    return nil
end





