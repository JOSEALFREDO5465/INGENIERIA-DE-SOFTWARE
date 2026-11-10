const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

// .xlsx es un ZIP; usar PowerShell Expand-Archive via node no. Hacemos unzip manual simple? Probar si existe unzip.
// Mejor: usar PowerShell con .NET
const script = `
$zip = [System.IO.Compression.ZipFile]::OpenRead("C:\\Users\\ssd\\Downloads\\Cabecera_Inventario.xlsx")
foreach ($entry in $zip.Entries) { Write-Output ($entry.FullName + " [" + $entry.Length + "]") }
$zip.Dispose()
`;
fs.writeFileSync('tmp_list.ps1', script, 'utf8');
