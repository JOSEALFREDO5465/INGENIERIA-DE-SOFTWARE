Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("C:\Users\ssd\Downloads\Cabecera_Inventario.xlsx")
foreach ($entry in $zip.Entries) { Write-Output ($entry.FullName + " [" + $entry.Length + "]") }
$zip.Dispose()
