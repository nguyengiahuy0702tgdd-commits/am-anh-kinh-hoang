# May chu web nho chay tren may ban (chi localhost) de trinh duyet nap duoc anh/mo hinh 3D vao WebGL.
# Mo bang CHAY-GAME.bat. Dong cua so nay = tat may chu.
$root = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$mime = @{ ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".json" = "application/json; charset=utf-8";
  ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".png" = "image/png"; ".gltf" = "model/gltf+json"; ".bin" = "application/octet-stream"; ".woff2" = "font/woff2"; ".ttf" = "font/ttf";
  ".mp3" = "audio/mpeg"; ".ogg" = "audio/ogg"; ".wav" = "audio/wav"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon" }
$l = $null; $port = 8642
for ($try = 0; $try -lt 20; $try++) {
  $l = New-Object Net.HttpListener; $l.Prefixes.Add("http://localhost:$port/")
  try { $l.Start(); break } catch { $l = $null; $port++ }
}
if (-not $l) { Write-Host "Khong mo duoc cong mang nao (8642-8661)." -ForegroundColor Red; pause; exit 1 }
$page = if (Test-Path (Join-Path $root "index.html")) { "index.html" } else { "am-anh-kinh-hoang.html" }
$url = "http://localhost:$port/$page"
Write-Host "Game dang chay tai: $url" -ForegroundColor Yellow
Write-Host "Giu cua so nay mo trong luc choi. Dong cua so de tat."
Start-Process $url
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq "") { $rel = $page }
    $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if ($full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $full -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($full); $ext = [IO.Path]::GetExtension($full).ToLower()
      $c.Response.ContentType = if ($mime[$ext]) { $mime[$ext] } else { "application/octet-stream" }
      $c.Response.Headers.Add("Cache-Control", "no-cache")
      $c.Response.ContentLength64 = $b.Length; $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch {} finally { try { $c.Response.Close() } catch {} }
}
