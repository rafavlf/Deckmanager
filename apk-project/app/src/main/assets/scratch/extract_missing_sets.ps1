$BaseDir = "d:\RepoTCG\Deckmanager\apk-project\app\src\main\assets"
$backupPath = Join-Path $BaseDir "index-backup.html"
$outputDir = Join-Path $BaseDir "sets"
$indexJsonPath = Join-Path $outputDir "index.json"

# 1. Get required siglas from index.json
if (-not (Test-Path $indexJsonPath)) {
    Write-Error "index.json not found at $indexJsonPath"
    exit
}
$indexContent = Get-Content $indexJsonPath -Raw | ConvertFrom-Json
$allSiglas = $indexContent.sigla

# 2. Check existing CSVs
$existingCSVs = Get-ChildItem $outputDir -Filter "*.csv" | Select-Object -ExpandProperty BaseName
$missingSiglas = $allSiglas | Where-Object { $_ -notin $existingCSVs }

Write-Host "Required Siglas: $($allSiglas -join ', ')"
Write-Host "Existing CSVs: $($existingCSVs -join ', ')"
Write-Host "Missing Siglas: $($missingSiglas -join ', ')"

if (-not $missingSiglas) {
    Write-Host "No missing sets to extract."
    exit
}

# 3. Read index-backup.html
if (-not (Test-Path $backupPath)) {
    Write-Error "index-backup.html not found at $backupPath"
    exit
}
Write-Host "Reading index-backup.html (this may take a few seconds)..."
$html = [System.IO.File]::ReadAllText($backupPath, [System.Text.Encoding]::UTF8)

# 4. Regex for sets
$pattern = '\{\s*sigla:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*cards:\s*(\[.*?\])\s*\}'
$matches = [regex]::Matches($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-Host "Found $($matches.Count) sets in backup file."

$extractedCount = 0
foreach ($m in $matches) {
    $sigla = $m.Groups[1].Value
    if ($sigla -in $missingSiglas) {
        Write-Host "Processing $sigla..."
        $cardsJson = $m.Groups[3].Value
        
        # Parse individual cards using regex
        $cardPattern = '\{"id":"([^"]+)","name":"([^"]+)","set":"[^"]+","number":"([^"]+)"\}'
        $cardMatches = [regex]::Matches($cardsJson, $cardPattern)
        
        if ($cardMatches.Count -eq 0) {
            # Try a slightly more flexible pattern in case spaces vary
            $cardPattern = '\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"set"\s*:\s*"[^"]+"\s*,\s*"number"\s*:\s*"([^"]+)"\s*\}'
            $cardMatches = [regex]::Matches($cardsJson, $cardPattern)
        }

        $csvPath = Join-Path $outputDir "$sigla.csv"
        $csvContent = "id,name,number`r`n"
        
        foreach ($cm in $cardMatches) {
            $id = $cm.Groups[1].Value
            $name = $cm.Groups[2].Value
            $number = $cm.Groups[3].Value
            # Escape quotes in name for CSV
            $escapedName = $name.Replace('"', '""')
            $csvContent += "$id,""$escapedName"",$number`r`n"
        }
        
        [System.IO.File]::WriteAllText($csvPath, $csvContent, [System.Text.Encoding]::UTF8)
        Write-Host "Successfully saved $sigla.csv with $($cardMatches.Count) cards."
        $extractedCount++
    }
}

Write-Host "Extraction complete. Total sets extracted: $extractedCount"
