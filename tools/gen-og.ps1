$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'assets\og.png'
$logoPath = Join-Path $root 'assets\logo.png'

$W = 1200
$H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.Clear([System.Drawing.Color]::FromArgb(255, 7, 12, 22))

$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 9, 16, 30), [System.Drawing.Color]::FromArgb(255, 24, 70, 140), 40)
$g.FillRectangle($grad, $rect)

function Draw-Glow($cx, $cy, $r, $a) {
  $pb = New-Object System.Drawing.Drawing2D.GraphicsPath
  $pb.AddEllipse($cx - $r, $cy - $r, 2 * $r, 2 * $r)
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($pb)
  $brush.CenterColor = [System.Drawing.Color]::FromArgb($a, 36, 137, 253)
  $brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 36, 137, 253))
  $g.FillEllipse($brush, $cx - $r, $cy - $r, 2 * $r, 2 * $r)
  $brush.Dispose()
  $pb.Dispose()
}
Draw-Glow 250 160 420 70
Draw-Glow 1020 520 480 60
Draw-Glow 600 320 640 45

$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(16, 255, 255, 255), 1)
for ($x = 0; $x -le $W; $x += 60) { $g.DrawLine($pen, $x, 0, $x, $H) }
for ($y = 0; $y -le $H; $y += 60) { $g.DrawLine($pen, 0, $y, $W, $y) }

$logo = [System.Drawing.Image]::FromFile($logoPath)
$lw = 300
$lh = [int]($logo.Height * ($lw / $logo.Width))
$g.DrawImage($logo, [int](($W - $lw) / 2), 128, $lw, $lh)

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = 'Center'
$sf.LineAlignment = 'Center'

$fontBrand = New-Object System.Drawing.Font('Arial', 74, [System.Drawing.FontStyle]::Bold)
$brushBrand = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 236, 242, 239))
$g.DrawString('CORPTCHA', $fontBrand, $brushBrand, (New-Object System.Drawing.RectangleF(0, 452, $W, 96)), $sf)

$fontSub = New-Object System.Drawing.Font('Arial', 25)
$brushSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(205, 214, 224, 232))
$g.DrawString('HUMAN VERIFICATION FOR THE AI ERA', $fontSub, $brushSub, (New-Object System.Drawing.RectangleF(0, 552, $W, 56)), $sf)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$logo.Dispose()
Write-Host "saved: $out"
