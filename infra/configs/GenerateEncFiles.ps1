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

    Write-Host "Encrypting $inputFile -> $outputFile"

    # Temp file for binary-safe input
    $tmp = New-TemporaryFile
    Get-Content $inputFile -Raw | Out-File -Encoding utf8 -NoNewline $tmp

    # Run OpenSSL encryption
    $encCommand = "openssl rsautl -encrypt -inkey `"$PublicKeyFile`" -pubin -in `"$tmp`" -out `"$outputFile`""
    Invoke-Expression $encCommand

    Remove-Item $tmp
}

Write-Host "✅ Encryption complete for all matching .enc.json files."