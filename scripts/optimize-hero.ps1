$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$quality = New-Object System.Drawing.Imaging.EncoderParameters(1)
$quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
$before = 0
$after = 0
Get-ChildItem 'assets/Hero section' -Recurse -Filter '*.png' | ForEach-Object {
  $source = [System.Drawing.Image]::FromFile($_.FullName)
  $limit = if ($_.Directory.Name -eq 'desktop') { 1920 } else { 960 }
  $width = [Math]::Min($limit, $source.Width)
  $height = [int][Math]::Round($source.Height * $width / $source.Width)
  $bitmap = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($source, 0, 0, $width, $height)
    $target = [System.IO.Path]::ChangeExtension($_.FullName, '.jpg')
    $bitmap.Save($target, $encoder, $quality)
    $before += $_.Length
    $after += (Get-Item -LiteralPath $target).Length
  } finally { $graphics.Dispose(); $bitmap.Dispose(); $source.Dispose() }
}
$quality.Dispose()
Write-Output "Hero images: $before bytes to $after bytes"
