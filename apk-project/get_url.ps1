$content = (Invoke-WebRequest -Uri 'https://developer.android.com/studio').Content
if ($content -match 'https://dl\.google\.com/android/repository/commandlinetools-win-[0-9]+_latest\.zip') {
    Write-Output $matches[0]
}
