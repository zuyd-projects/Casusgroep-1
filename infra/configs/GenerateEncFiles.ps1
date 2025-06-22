param(
    [string]$PublicKeyFile = "public.key"
)

if (!(Test-Path $PublicKeyFile)) {
    Write-Error "Public key file '$PublicKeyFile' not found."
    exit 1
}

Get-ChildItem -Filter "*.enc.json" | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = "$($inputFile -replace '\.enc\.json$', '.enc')"
    $aesKeyFile = "$($inputFile -replace '\.enc\.json$', '.aes.key')"
    $aesKeyEncFile = "$($inputFile -replace '\.enc\.json$', '.key.enc')"

    Write-Host "Encrypting $inputFile"

    # 1. Generate random 32-byte AES key
    openssl rand -out $aesKeyFile 32

    # 2. Encrypt JSON config file with AES key (AES-256-CBC)
    # Use a random salt and a password from the AES key file in binary mode
    openssl enc -aes-256-cbc -salt -in $inputFile -out $outputFile -pass file:$aesKeyFile

    # 3. Encrypt AES key with RSA public key
    openssl pkeyutl -encrypt -pubin -inkey $PublicKeyFile -in $aesKeyFile -out $aesKeyEncFile

    # 4. Remove unencrypted AES key file
    Remove-Item $aesKeyFile

    Write-Host "  -> Encrypted config saved to $outputFile"
    Write-Host "  -> Encrypted AES key saved to $aesKeyEncFile"
}

Write-Host "✅ Hybrid RSA+AES encryption complete for all matching .enc.json files."
