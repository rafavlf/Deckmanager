$xml = Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/repository2-3.xml' -UseBasicParsing
$xml.Content | Select-String -Pattern 'commandlinetools-win-[0-9]+_latest\.zip' -AllMatches | ForEach-Object { $_.Matches.Value } | Select-Object -Unique
