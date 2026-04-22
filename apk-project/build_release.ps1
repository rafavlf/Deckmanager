$keystoreFile = "app\deckmanager.jks"

if (Test-Path $keystoreFile) {
    Write-Output "Deleting existing keystore..."
    Remove-Item -Force $keystoreFile
}

Write-Output "Generating new keystore..."
# Execute keytool to generate the keystore
cmd.exe /c "keytool -genkey -v -keystore $keystoreFile -alias deckmanager_key -keyalg RSA -keysize 2048 -validity 10000 -storepass `"DeckManager2026!`" -keypass `"DeckManager2026!`" -dname `"CN=Rafael, O=TCG, C=BR`""

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to generate keystore."
    exit $LASTEXITCODE
}

Write-Output "Building release..."
.\gradlew.bat clean assembleRelease --no-daemon
