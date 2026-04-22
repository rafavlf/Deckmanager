$androidHome = "D:\AndroidSDK"
$cmdlineToolsBin = "$androidHome\cmdline-tools\latest\bin"
$platformTools = "$androidHome\platform-tools"

# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
Write-Output "ANDROID_HOME set to $androidHome"

# Update PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPaths = @($cmdlineToolsBin, $platformTools)

foreach ($path in $newPaths) {
    if ($currentPath -notmatch [regex]::Escape($path)) {
        if ($currentPath -eq $null -or $currentPath.Trim() -eq "") {
            $currentPath = $path
        } else {
            if (-not $currentPath.EndsWith(";")) {
                $currentPath += ";"
            }
            $currentPath += $path
        }
    }
}

[Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
Write-Output "PATH updated to include: $cmdlineToolsBin and $platformTools"
