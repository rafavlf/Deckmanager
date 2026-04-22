$ProgressPreference = 'SilentlyContinue'
$sdkPath = "D:\AndroidSDK"
$cmdlineToolsPath = "$sdkPath\cmdline-tools"
$latestPath = "$cmdlineToolsPath\latest"
$zipPath = "$sdkPath\cmdline-tools.zip"
$downloadUrl = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"

Write-Output "Creating directories..."
New-Item -ItemType Directory -Force -Path $sdkPath | Out-Null
New-Item -ItemType Directory -Force -Path $cmdlineToolsPath | Out-Null

Write-Output "Downloading Command Line Tools..."
# Set SecurityProtocol to ensure TLS 1.2 is used
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

Write-Output "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $sdkPath -Force

Write-Output "Moving to 'latest' directory..."
# The zip extracts to a folder named 'cmdline-tools'
# We need it to be inside D:\AndroidSDK\cmdline-tools\latest
if (Test-Path "$latestPath") {
    Remove-Item -Recurse -Force "$latestPath"
}
Rename-Item -Path "$sdkPath\cmdline-tools" -NewName "latest"
# Move 'latest' inside the actual $cmdlineToolsPath
New-Item -ItemType Directory -Force -Path $cmdlineToolsPath | Out-Null
Move-Item -Path "$sdkPath\latest" -Destination $cmdlineToolsPath

Write-Output "Cleaning up..."
Remove-Item -Path $zipPath -Force

Write-Output "Done."
