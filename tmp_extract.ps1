Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("C:\Users\ssd\Downloads\Cabecera_Inventario.xlsx")
$outDir = "C:\Users\ssd\Desktop\INGENIERIA DE SOFTWARE\tmp_xlsx"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
foreach ($entry in $zip.Entries) {
  $dest = Join-Path $outDir $entry.FullName
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
}
$zip.Dispose()
Write-Output "extraido en $outDir"
