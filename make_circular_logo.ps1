Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\Nagraj\Desktop\outing_leave_manage_sys\frontend\public\logo.png'
$dst = 'C:\Users\Nagraj\Desktop\outing_leave_manage_sys\frontend\public\logo.png'

$original = [System.Drawing.Image]::FromFile($src)

# Use the smaller dimension for a square crop
$size = [Math]::Min($original.Width, $original.Height)

$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Transparent background
$g.Clear([System.Drawing.Color]::Transparent)

# Circular clip path
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $size, $size)
$g.SetClip($path)

# Center-crop and draw
$offsetX = [int](($original.Width - $size) / 2)
$offsetY = [int](($original.Height - $size) / 2)
$srcRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $size, $size)
$dstRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$g.DrawImage($original, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$original.Dispose()

$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Done! Circular logo saved to $dst"
