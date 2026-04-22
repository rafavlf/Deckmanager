$sdkmanager = "D:\AndroidSDK\cmdline-tools\latest\bin\sdkmanager.bat"
$env:ANDROID_HOME = "D:\AndroidSDK"

Write-Output "Accepting licenses..."
# Piping 'y' to sdkmanager --licenses
cmd.exe /c "echo y | `"$sdkmanager`" --licenses"

Write-Output "Installing packages..."
& $sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"

Write-Output "Done installing packages."
