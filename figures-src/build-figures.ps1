# Pipeline: figures-src/<topic>/*.tex --(pdflatex)--> PDF --(dvisvgm)--> public/figures/<topic>/*.svg
# Dong thoi doc dong %META trong file .tex va sinh src/data/figures-manifest.json
# Chay:  npm run figures   (hoac:  powershell figures-src/build-figures.ps1 [-Topic count-angles])

param([string]$Topic = "")

$figuresSrc = $PSScriptRoot
$root = Split-Path $PSScriptRoot -Parent
$pub = Join-Path (Join-Path $root 'public') 'figures'
$data = Join-Path (Join-Path $root 'src') 'data'
$manifestPath = Join-Path $data 'figures-manifest.json'

New-Item -ItemType Directory -Force -Path $pub, $data | Out-Null
$env:TEXINPUTS = "$figuresSrc;" + $env:TEXINPUTS

$manifest = [ordered]@{}
foreach ($dirInfo in (Get-ChildItem $figuresSrc -Directory)) {
    $t = $dirInfo.Name
    if ($Topic -and $t -ne $Topic) { continue }
    $dir = $dirInfo.FullName
    New-Item -ItemType Directory -Force -Path (Join-Path $pub $t) | Out-Null
    $entries = @()

    foreach ($tex in (Get-ChildItem $dir -Filter '*.tex' | Sort-Object Name)) {
        $base = $tex.BaseName
        Write-Host "[$t/$base] build..." -NoNewline

        # 1) pdflatex -> PDF  (dung duong dan tuyet doi, khong phu thuoc CWD)
        $pdf = Join-Path $dir "$base.pdf"
        & pdflatex -interaction=nonstopmode -halt-on-error "-output-directory=$dir" $tex.FullName 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Host " LATEX FAIL" -ForegroundColor Red; continue }

        # 2) dvisvgm -> SVG (fonts -> paths, khong phu thuoc font web)
        $svg = Join-Path (Join-Path $pub $t) "$base.svg"
        & dvisvgm --pdf --no-fonts --exact --precision=3 $pdf -o $svg > (Join-Path $dir "$base.dvisvgm.log") 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Host " SVGM FAIL" -ForegroundColor Red; continue }

        # 3) Doc %META de sinh manifest (chi dinh UTF-8 de khong loi tieng Viet)
        $texBytes = [IO.File]::ReadAllText($tex.FullName, (New-Object System.Text.UTF8Encoding $false))
        $metaLine = [regex]::Match($texBytes, '(?m)^%META\s+(.+)$')
        if (-not $metaLine.Success) { Write-Host " KHONG META" -ForegroundColor Yellow; continue }
        $entry = $metaLine.Groups[1].Value | ConvertFrom-Json
        $entry | Add-Member -NotePropertyName file -NotePropertyValue $base -Force
        $entry | Add-Member -NotePropertyName id -NotePropertyValue $base -Force
        $entries += $entry
        Write-Host " ok ($([math]::Round((Get-Item $svg).Length / 1KB, 1)) KB)" -ForegroundColor Green
    }
    $manifest[$t] = $entries
}

$json = $manifest | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText($manifestPath, $json, (New-Object System.Text.UTF8Encoding $false))
Write-Host ""
Write-Host "=> figures : $pub" -ForegroundColor Cyan
Write-Host "=> manifest: $manifestPath" -ForegroundColor Cyan
