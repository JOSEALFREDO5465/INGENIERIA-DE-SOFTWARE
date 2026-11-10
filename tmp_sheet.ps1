$xml = Get-Content "C:\Users\ssd\Desktop\INGENIERIA DE SOFTWARE\tmp_xlsx\xl\styles.xml" -Raw
$xml = $xml -replace '><', ">`n<"
$xml
