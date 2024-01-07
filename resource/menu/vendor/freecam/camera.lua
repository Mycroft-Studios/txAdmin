local floor = math.floor
local vector3 = vector3
local SetCamRot = SetCamRot
local IsCamActive = IsCamActive
local SetCamCoord = SetCamCoord
local LoadInterior = LoadInterior
local SetFocusPosAndVel = SetFocusPosAndVel
local LockMinimapAngle = LockMinimapAngle
local GetInteriorAtCoords = GetInteriorAtCoords
local LockMinimapPosition = LockMinimapPosition

local _internal_camera = nil
local _internal_isFrozen = false

local _internal_pos = nil
local _internal_rot = nil
local _internal_fov = nil
local _internal_vecX = nil
local _internal_vecY = nil
local _internal_vecZ = nil

if IS_NY then
  GetGameplayCamCoord = function()
    local gameCam = GetGameCam()
    local camPosX, CamPosY, CamPosZ = GetCamPos(gameCam)
    return vector3(camPosX, CamPosY, CamPosZ)
  end

  GetGameplayCamRot = function()
    local gameCam = GetGameCam()
    local camRotX, CamRotY, CamRotZ = GetCamRot(gameCam, 2)
    return vector3(camRotX, CamRotY, CamRotZ)
  end

  SetCamCoord = function(cam, x, y, z)
    print('SetCamCoord', cam, x, y, z)
    Citizen.InvokeNative(`SET_CAM_POS`, cam, x, y, z)
  end
  SetFocusPosAndVel = function()
    -- nil function for NY
    return
  end

  LockMinimapAngle = function()
    return
  end
  UnlockMinimapAngle = function()
    return
  end

  ClearFocus = function()
    return
  end
end
--------------------------------------------------------------------------------

function GetInitialCameraPosition()
  if _G.CAMERA_SETTINGS.KEEP_POSITION and _internal_pos then
    return _internal_pos
  end

  return GetGameplayCamCoord()
end

function GetInitialCameraRotation()
  if _G.CAMERA_SETTINGS.KEEP_ROTATION and _internal_rot then
    return _internal_rot
  end

  local rot = GetGameplayCamRot(2)
  return vector3(rot.x, 0.0, rot.z)
end

--------------------------------------------------------------------------------

function IsFreecamFrozen()
  return _internal_isFrozen
end

function SetFreecamFrozen(frozen)
  _internal_isFrozen = (frozen == true)
end

--------------------------------------------------------------------------------

function GetFreecamPosition()
  return _internal_pos
end

-- NOTE: if ever removing the SetEntityCoords and doing just camera, need to load interiors somwhow
-- in this case, do something like https://github.com/tabarra/txAdmin/pull/789
function SetFreecamPosition(x, y, z)
  local pos = vector3(x, y, z)
  -- local int = GetInteriorAtCoords(pos)
  -- LoadInterior(int)
  SetFocusPosAndVel(x, y, z, 0.0, 0.0, 0.0)
  SetCamCoord(_internal_camera, x, y, z)
  if IS_FIVEM then
    LockMinimapPosition(x, y)
  end

  _internal_pos = pos
end

--------------------------------------------------------------------------------

function GetFreecamRotation()
  return _internal_rot
end


function SetFreecamRotation(x, y, z)
  local rotX, rotY, rotZ = ClampCameraRotation(x, y, z)
  local vecX, vecY, vecZ = EulerToMatrix(rotX, rotY, rotZ)
  local rot = vector3(rotX, rotY, rotZ)

  LockMinimapAngle(floor(rotZ))
  SetCamRot(_internal_camera, rotX, rotY, rotZ, 2)

  _internal_rot  = rot
  _internal_vecX = vecX
  _internal_vecY = vecY
  _internal_vecZ = vecZ
end

--------------------------------------------------------------------------------

function GetFreecamFov()
  return _internal_fov
end

function SetFreecamFov(fov)
  local fov = Clamp(fov, 0.0, 90.0)
  SetCamFov(_internal_camera, fov)
  _internal_fov = fov
end

--------------------------------------------------------------------------------

function GetFreecamMatrix()
  return _internal_vecX,
         _internal_vecY,
         _internal_vecZ,
         _internal_pos
end

function GetFreecamTarget(distance)
  local target = _internal_pos + (_internal_vecY * distance)
  return target
end

--------------------------------------------------------------------------------

function IsFreecamActive()
  if not _internal_camera or not DoesCamExist(_internal_camera) then
    return false
  end
  return IsCamActive(_internal_camera) == 1
end

function SetFreecamActive(active)
  if active == IsFreecamActive() then
    return
  end

  local enableEasing = _G.CAMERA_SETTINGS.ENABLE_EASING
  local easingDuration = _G.CAMERA_SETTINGS.EASING_DURATION

  if active then
    local pos = GetInitialCameraPosition()
    local rot = GetInitialCameraRotation()

    _internal_camera = IS_NY and CreateCam(14) or CreateCam('DEFAULT_SCRIPTED_CAMERA', true)

    SetCamActive(_internal_camera, active)
    SetFreecamFov(_G.CAMERA_SETTINGS.FOV)
    SetFreecamPosition(pos.x, pos.y, pos.z)
    SetFreecamRotation(rot.x, rot.y, rot.z)
    TriggerEvent('freecam:onEnter')
  else
    DestroyCam(_internal_camera)
    ClearFocus()
    UnlockMinimapAngle()
    if IS_FIVEM then
      UnlockMinimapPosition()
    end
    TriggerEvent('freecam:onExit')
  end

  if IS_NY then
    ActivateScriptedCams(active, active)
  else 
    RenderScriptCams(active, enableEasing, easingDuration, true, true)
  end
end
