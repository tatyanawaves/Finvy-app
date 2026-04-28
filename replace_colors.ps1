$dir = "C:\Users\tatya\AndroidStudioProjects\finmap-clone\src"
Get-ChildItem -Path $dir -Recurse -Include "*.jsx","*.js","*.ts","*.tsx","*.css" | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
  $c = $c.Replace('#3DD9B3', '#4F8EF7')
  $c = $c.Replace('#10b981', '#3B82F6')
  $c = $c.Replace('#6ee7b7', '#93C5FD')
  [System.IO.File]::WriteAllText($_.FullName, $c, [System.Text.Encoding]::UTF8)
}
Write-Host "Color replacement done"
