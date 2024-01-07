-- =============================================
--  ServerCtx Synchronization
-- =============================================
ServerCtx = false

--- Updates ServerCtx based on GlobalState and will send it to NUI
--- NOTE: for now the ServerCtx is only being set when the menu tries to load (enabled or not)
function updateServerCtx()
   -- stateBagServerCtx = GlobalState.txAdminServerCtx
   -- if stateBagServerCtx == nil then
   --     debugPrint('^3ServerCtx fallback support activated.')
        TriggerServerEvent('txsv:req:serverCtx')
   -- else
   --     ServerCtx = stateBagServerCtx
        debugPrint('^2ServerCtx updated from global state')
   -- end
end

RegisterNetEvent('txcl:setServerCtx', function(ctx)
    if type(ctx) ~= 'table' then return end
    ServerCtx = ctx
    debugPrint('^2ServerCtx updated from server event.')
    sendMenuMessage('setServerCtx', ServerCtx)
end)



-- =============================================
--  Announcement, DirectMessage and Warn handling
-- =============================================
-- Dispatch Announcements
RegisterNetEvent('txcl:showAnnouncement', function(message, author)
    sendMenuMessage(
        'addAnnounceMessage',
        {
            message = message,
            author = author
        }
    )
end)
RegisterNetEvent('txcl:showDirectMessage', function(message, author)
    sendMenuMessage(
        'addDirectMessage',
        {
            message = message,
            author = author
        }
    )
end)

-- TODO: remove [SPACE] holding requirement?
local dismissKey, dismissKeyGroup
if IS_FIVEM then
    dismissKey = 22
    dismissKeyGroup = 0
else
    dismissKey = 0xD9D0E1C0
    dismissKeyGroup = 1
end

RegisterNetEvent('txcl:showWarning', function(author, reason)
    toggleMenuVisibility(false)
    sendMenuMessage('setWarnOpen', {
        reason = reason,
        warnedBy = author
    })
    CreateThread(function()
        local countLimit = 100 --10 seconds
        local count = 0
        while true do
            Wait(100)
            if IsControlPressed(dismissKeyGroup, dismissKey) then
                count = count + 1
                if count >= countLimit then
                    sendMenuMessage('closeWarning')
                    return
                elseif math.fmod(count, 10) == 0 then
                    sendMenuMessage('pulseWarning')
                end
            else
                count = 0
            end
        end
    end)
end)


-- =============================================
--  Other stuff
-- =============================================
-- Removing unwanted chat suggestions
-- We only want suggestion for: /tx, /txAdmin-reauth
-- The suggestion is added after 500ms, so we need to wait more
CreateThread(function()
    Wait(1000)
    local suggestionsToRemove = {
        --Commands
        '/txadmin',
        '/txaPing',
        '/txaKickAll',
        '/txaEvent',
        '/txaReportResources',
        '/txaSetDebugMode',

        --Keybinds
        '/txAdmin:menu:noClipToggle',
        '/txAdmin:menu:openPlayersPage',
        '/txAdmin:menu:togglePlayerIDs',

        --Convars
        '/txAdmin-version',
        '/txAdmin-locale',
        '/txAdmin-localeFile',
        '/txAdmin-verbose',
        '/txAdmin-luaComHost',
        '/txAdmin-luaComToken',
        '/txAdmin-checkPlayerJoin',
        '/txAdmin-pipeToken',
        '/txAdmin-debugMode',
        '/txAdmin-hideDefaultAnnouncement',
        '/txAdmin-hideDefaultDirectMessage',
        '/txAdmin-hideDefaultWarning',
        '/txAdmin-hideDefaultScheduledRestartWarning',
        '/txAdminServerMode',

        --Menu convars
        '/txAdmin-menuEnabled',
        '/txAdmin-menuAlignRight',
        '/txAdmin-menuPageKey',
        '/txAdmin-menuPlayerIdDistance',
        '/txAdmin-menuDrunkDuration'
    }

    for _, suggestion in ipairs(suggestionsToRemove) do
        TriggerEvent('chat:removeSuggestion', suggestion)
    end
end)


-- =============================================
local isNoclipping = false
local noclipCam = nil
local speed = 0.5
-- Toggles noclip
RegisterCommand("noclip", function(source, args, raw)
    isNoclipping = not isNoclipping
    local PlyId = GetPlayerId()
    local Ped = GetPlayerChar(PlyId)
    FreezeCharPosition(Ped, isNoclipping)
    print("Noclip:" .. tostring(isNoclipping) .. " | " .. tostring(PlyId) .. " | " .. tostring(Ped))
    SetCharVisible(Ped, true)
    SetCharInvincible(Ped, isNoclipping)
    local px, py, pz = GetCharCoordinates(Ped)
    SetPlayerControl(PlyId, not isNoclipping)
    SetCharCollision(Ped, not isNoclipping)
    if isNoclipping then
        CreateThread(function()
            while isNoclipping do
                local x,y = GetKeyboardMoveInput()
                px, py = GetCharCoordinates(Ped)
                local heading = GetCharHeading(Ped)

                if y == -127 then
                    print("W Pressed") 
                    -- work out out coords, based upon the heading, should have 4 if statements for each direction
                     if heading > 0 and heading < 90 then
                        py = py + speed
                    elseif heading > 90 and heading < 180 then
                        py = py - speed
                    elseif heading > 180 and heading < 270 then
                        py = py - speed
                    elseif heading > 270 and heading < 360 then
                        py = py + speed
                    end
                    SetCharCoordinates(Ped, px, py, pz)
                end
                
                if y == 127 then
                    print("S Pressed")
                    if heading > 0 and heading < 90 then
                        py = py - speed
                    elseif heading > 90 and heading < 180 then
                        py = py + speed
                    elseif heading > 180 and heading < 270 then
                        py = py + speed
                    elseif heading > 270 and heading < 360 then
                        py = py - speed
                    end
                    SetCharCoordinates(Ped, px, py, pz)
                end
                
                if x == -127 then
                    print("A Pressed")
                    if heading > 0 and heading < 90 then
                        px = px - speed
                    elseif heading > 90 and heading < 180 then
                        px = px - speed
                    elseif heading > 180 and heading < 270 then
                        px = px + speed
                    elseif heading > 270 and heading < 360 then
                        px = px + speed
                    end
                    SetCharCoordinates(Ped, px, py, pz)
                end
                if x == 127 then
                    print("D Pressed")
                    if heading > 0 and heading < 90 then
                        px = px + speed
                    elseif heading > 90 and heading < 180 then
                        px = px + speed
                    elseif heading > 180 and heading < 270 then
                        px = px - speed
                    elseif heading > 270 and heading < 360 then
                        px = px - speed
                    end
                    SetCharCoordinates(Ped, px, py, pz)
                end
                if IsGameKeyboardNavUpPressed() then
                    pz = pz + 1
                    SetCharCoordinates(Ped, px, py, pz)
                end
                if IsGameKeyboardNavDownPressed() then
                    pz = pz - 1
                    SetCharCoordinates(Ped, px, py, pz)
                end

                if IsGameKeyboardNavLeftPressed() then
                    heading = heading + 1
                    if heading > 360 then
                        heading = 0
                    end
                    SetCharHeading(Ped, heading)
                end

                if IsGameKeyboardNavRightPressed() then
                    heading = heading - 1
                    if heading < 0 then
                        heading = 360
                    end
                    SetCharHeading(Ped, heading)
                end
                Wait(0)
            end
        end)
    else 
        return
    end
end)


RegisterCommand("kill", function(source, args, raw)
    local PlyId = GetPlayerId()
    local Ped = GetPlayerChar(PlyId)
    if Ped ~= nil then
        SetCharHealth(Ped, 0)
    end
end)

RegisterCommand("car", function(source, args, raw)
    if not args[1] then
        args[1] = "taxi"
    end
    local model = joaat(args[1])

    RequestModel(model)
    while not HasModelLoaded(model) do
        Wait(0)
    end
    local ply = GetPlayerId()
    local ped = GetPlayerChar(ply)
    local x, y, z = GetCharCoordinates(ped)
    print("model: " .. tostring(model))
    print("X: " .. tostring(x) .. " | Y: " .. tostring(y) .. " | Z: " .. tostring(z))
    local car = CreateCar(model, x, y, z, true)
    MarkCarAsNoLongerNeeded(car)
    MarkModelAsNoLongerNeeded(model)
end)

RegisterCommand("hostinfo", function(source, args, raw)
    print("HostID:" .. tostring(GetHostId()))
    print("Host Latency:" .. tostring(NetworkGetHostLatency(GetHostId())))
    print("Host Name:" .. tostring(NetworkGetHostServerName(GetHostId())))
    print("isStarted:" .. tostring(NetworkIsSessionStarted()))
    print("IsNetworkSession: " .. tostring(IsNetworkSession()))
    print("isLan:" .. tostring(IsInLanMode()))
    print("OnlineLan:" .. tostring(GetOnlineLan()))
    print("LanSession:" .. tostring(NetworkGetLanSession()))
    print("Open Slots:" .. tostring(NetworkGetNumOpenPublicSlots()))
    print("Strict NAT:" .. tostring(NetworkHasStrictNat()))
end)

RegisterCommand("coords", function(source, args, raw)
    local ply = GetPlayerId()
    local ped = GetPlayerChar(ply)
    local x, y, z = GetCharCoordinates(ped)
    print(vector3(x, y, z))
end)

SetOnlineLan(true)
Citizen.InvokeNative(`NETWORK_CHANGE_EXTENDED_GAME_CONFIG_CIT`)