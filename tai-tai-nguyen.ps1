# Tai tai nguyen quet 3D + vat lieu PBR tu Poly Haven (CC0, mien phi) vao thu muc assets\
# Chay bang file TAI-TAI-NGUYEN.bat o thu muc goc cua game. Chay lai bao nhieu lan cung duoc: file da co se bo qua.
param([string]$Res = "")
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$UA = "AmAnhKinhHoang-TaiNguyen/1.0 (game ca nhan, phi thuong mai)"
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "assets"
$list = Get-Content (Join-Path $assets "danh-sach.json") -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $Res) { $Res = $list.do_phan_giai }; if (-not $Res) { $Res = "1k" }
$manPath = Join-Path $assets "manifest.json"
$man = @{ models = @{}; textures = @{} }
if (Test-Path $manPath) {   # giu lai muc da tai truoc do (neu lan nay mat mang)
  try { $old = Get-Content $manPath -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($p in $old.models.PSObject.Properties) { $man.models[$p.Name] = $p.Value }
    foreach ($p in $old.textures.PSObject.Properties) { $man.textures[$p.Name] = @{ diff = $p.Value.diff; nor = $p.Value.nor; arm = $p.Value.arm } } } catch {}
}
$script:bytes = 0
function Get-File([string]$url, [string]$dest) {
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 0)) { return }
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  $tmp = "$dest.part"
  Invoke-WebRequest -Uri $url -OutFile $tmp -UserAgent $UA -UseBasicParsing
  Move-Item -Force $tmp $dest
  $script:bytes += (Get-Item $dest).Length
}
function Pick-Res($node) {   # lay dung do phan giai, neu khong co thi lay ban nho nhat
  if ($node.$Res) { return $node.$Res }
  foreach ($r in @("1k", "2k", "4k", "8k")) { if ($node.$r) { return $node.$r } }
  return $null
}
function Api([string]$id) { return Invoke-RestMethod -Uri "https://api.polyhaven.com/files/$id" -UserAgent $UA }

Write-Host ""
Write-Host "=== TAI TAI NGUYEN QUET 3D (Poly Haven, CC0) - do phan giai $Res ===" -ForegroundColor Yellow
Write-Host "Mo hinh: $($list.models.Count)  |  Vat lieu tuong/san: $($list.textures.Count)"
Write-Host ""
$ok = 0; $fail = 0; $i = 0
foreach ($id in $list.models) {
  $i++; Write-Host ("[{0}/{1}] Mo hinh {2} ..." -f $i, $list.models.Count, $id) -NoNewline
  try {
    $f = Api $id; $g = (Pick-Res $f.gltf).gltf
    if (-not $g) { throw "khong co ban glTF" }
    $dir = Join-Path $assets "models\$id"; $name = Split-Path $g.url -Leaf
    Get-File $g.url (Join-Path $dir $name)
    $inc = $g.include
    if ($inc -is [array]) { foreach ($it in $inc) { Get-File $it.url (Join-Path $dir ($it.path -replace '/', '\')) } }
    elseif ($inc) { foreach ($p in $inc.PSObject.Properties) { Get-File $p.Value.url (Join-Path $dir ($p.Name -replace '/', '\')) } }
    $man.models[$id] = "models/$id/$name"; $ok++; Write-Host " xong" -ForegroundColor Green
  } catch { $fail++; Write-Host " LOI: $($_.Exception.Message)" -ForegroundColor Red }
}
$i = 0
foreach ($id in $list.textures) {
  $i++; Write-Host ("[{0}/{1}] Vat lieu {2} ..." -f $i, $list.textures.Count, $id) -NoNewline
  try {
    $f = Api $id; $dir = Join-Path $assets "textures\$id"; $e = @{}
    foreach ($k in @(@("diff", "Diffuse"), @("nor", "nor_gl"), @("arm", "arm"))) {
      $n = Pick-Res $f.($k[1]); if (-not $n) { continue }
      $u = if ($n.jpg) { $n.jpg.url } else { $n.png.url }
      $leaf = Split-Path $u -Leaf; Get-File $u (Join-Path $dir $leaf); $e[$k[0]] = "textures/$id/$leaf"
    }
    if (-not $e.diff) { throw "khong co anh mau" }
    $man.textures[$id] = $e; $ok++; Write-Host " xong" -ForegroundColor Green
  } catch { $fail++; Write-Host " LOI: $($_.Exception.Message)" -ForegroundColor Red }
}
$json = $man | ConvertTo-Json -Depth 6
[IO.File]::WriteAllText($manPath, $json, (New-Object Text.UTF8Encoding $false))
Write-Host ""
Write-Host ("Hoan tat: {0} muc thanh cong, {1} loi, da tai them {2:N1} MB." -f $ok, $fail, ($script:bytes / 1MB)) -ForegroundColor Yellow
Write-Host "Tai nguyen: Poly Haven (polyhaven.com) - giay phep CC0. Powered by Poly Haven."
Write-Host "Bay gio mo game bang CHAY-GAME.bat."
