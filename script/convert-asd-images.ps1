param(
  [string]$SourceDir = "public\asd",
  [string]$TargetDir = "public\images\spare-parts\asd"
)

Add-Type -AssemblyName PresentationCore

$mappings = @(
  @{ Pattern = "altkoruma*.jpeg"; Target = "alt-koruma-cami.jpg" },
  @{ Source = "IMG_0077.HEIC"; Target = "img-0077-new.jpg" },
  @{ Source = "IMG_0095.HEIC"; Target = "img-0095-new.jpg" },
  @{ Source = "IMG_0100.HEIC"; Target = "img-0100-new.jpg" },
  @{ Source = "IMG_0152.png"; Target = "img-0152-new.jpg" },
  @{ Pattern = "kolimat?r.HEIC"; Target = "kolimator.jpg" },
  @{ Pattern = "kolimat?rlens.HEIC"; Target = "kolimator-lens.jpg" },
  @{ Source = "lazerkafasinyalkablosu.HEIC"; Target = "lazer-kafa-sinyal-kablosu.jpg" },
  @{ Source = "lazerkaynakodakborusu.HEIC"; Target = "lazer-kaynak-odak-borusu.jpg" },
  @{ Pattern = "lenskapa??.HEIC"; Target = "lens-kapagi.jpg" },
  @{ Pattern = "lenskapa??400serisi.HEIC"; Target = "lens-kapagi-400-serisi.jpg" },
  @{ Source = "odaklens.HEIC"; Target = "odak-lens.jpg" },
  @{ Pattern = "seramikcontas?.HEIC"; Target = "seramik-contasi.jpg" },
  @{ Pattern = "termal lazer*.png"; Target = "termal-lazer-guc-olcme.jpg" }
)

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$results = @()
$errors = @()

foreach ($item in $mappings) {
  $source = $item.Source
  if (-not $source) {
    $match = Get-ChildItem -LiteralPath $SourceDir -File | Where-Object { $_.Name -like $item.Pattern } | Select-Object -First 1
    if ($match) {
      $source = $match.Name
    }
  }

  $sourcePath = Join-Path $SourceDir $source
  $targetPath = Join-Path $TargetDir $item.Target

  try {
    if (-not $source) {
      throw "No source file found for pattern $($item.Pattern)"
    }

    $stream = [System.IO.File]::OpenRead((Resolve-Path -LiteralPath $sourcePath))
    try {
      $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
        $stream,
        [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat,
        [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
      )

      $frame = $decoder.Frames[0]
      $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
      $encoder.QualityLevel = 88
      $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($frame))

      $outStream = [System.IO.File]::Create((Join-Path (Resolve-Path -LiteralPath $TargetDir) $item.Target))
      try {
        $encoder.Save($outStream)
      } finally {
        $outStream.Dispose()
      }
    } finally {
      $stream.Dispose()
    }

    $file = Get-Item -LiteralPath $targetPath
    $results += [pscustomobject]@{
      Source = $source
      Url = "/images/spare-parts/asd/$($item.Target)"
      Bytes = $file.Length
    }
  } catch {
    $errors += [pscustomobject]@{
      Source = $source
      Target = $item.Target
      Error = $_.Exception.Message
    }
  }
}

[pscustomobject]@{
  Results = $results
  Errors = $errors
  Skipped = @("altkorumacamı.MOV")
} | ConvertTo-Json -Depth 5

if ($errors.Count -gt 0) {
  exit 1
}
