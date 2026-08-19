$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$provinceMap = @{
  "Attock"="PB";"Bahawalnagar"="PB";"Bahawalpur"="PB";"Bhakkar"="PB";"Chakwal"="PB";"Dera Ghazi Khan"="PB";
  "Faisalabad"="PB";"Gujranwala"="PB";"Gujrat"="PB";"Hafizabad"="PB";"Jhang"="PB";"Jhelum"="PB";"Kasur"="PB";
  "Khanewal"="PB";"Khushab"="PB";"Lahore"="PB";"Layyah"="PB";"Lodhran"="PB";"Mandi Bahauddin"="PB";"Mianwali"="PB";
  "Multan"="PB";"Muzaffargarh"="PB";"Narowal"="PB";"Okara"="PB";"Pakpattan"="PB";"Rahim Yar Khan"="PB";
  "Rajanpur"="PB";"Rawalpindi"="PB";"Sahiwal"="PB";"Sargodha"="PB";"Sheikhpura"="PB";"Sialkot"="PB";
  "Toba Tek Singh"="PB";"Vihari"="PB";

  "Badin"="SD";"Dadu"="SD";"Ghotki"="SD";"Hyderabad"="SD";"Jacobabad"="SD";"Jamshoro"="SD";"Karachi"="SD";
  "Kashmore"="SD";"Khairpur"="SD";"Matiari"="SD";"Mirpurkhas"="SD";"Naushehro Feroze"="SD";"Nawabshah"="SD";
  "Qambar Shahdadkot"="SD";"Sanghar"="SD";"Shikarpur"="SD";"Sukkur"="SD";"Tando Allahyar"="SD";
  "Tando Muhammad Khan"="SD";"Tharparkar"="SD";"Thatta"="SD";"Umerkot"="SD";

  "Abbottabad"="KP";"Bajaur"="KP";"Bannu"="KP";"Battagram"="KP";"Buner"="KP";"Charsadda"="KP";"Chitral"="KP";
  "Dera Ismail Khan"="KP";"Hangu"="KP";"Haripur"="KP";"Karak"="KP";"Khyber"="KP";"Kohat"="KP";"Kohistan"="KP";
  "Kurram"="KP";"Lakki Marwat"="KP";"Lower Dir"="KP";"Malakand"="KP";"Mansehra"="KP";"Mardan"="KP";"Mohmand"="KP";
  "North Waziristan"="KP";"Nowshera"="KP";"Orakzai"="KP";"Peshawar"="KP";"Shangla"="KP";"South Waziristan"="KP";
  "Swabi"="KP";"Swat"="KP";"Tank"="KP";"Upper Dir"="KP";

  "Awaran"="BL";"Barkhan"="BL";"Chagai"="BL";"Dera Bugti"="BL";"Gwadar"="BL";"Jafarabad"="BL";"Jhal Magsi"="BL";
  "Kalat"="BL";"Kech"="BL";"Kharan"="BL";"Khuzdar"="BL";"Kachhi"="BL";"Kohlu"="BL";"Lasbela"="BL";"Loralai"="BL";
  "Mastung"="BL";"Musakhel"="BL";"Nasirabad"="BL";"Nushki"="BL";"Panjgur"="BL";"Pishin"="BL";"Qilla Abdullah"="BL";
  "Qilla Saifullah"="BL";"Quetta"="BL";"Sibi"="BL";"Zhob"="BL";"Ziarat"="BL";

  "Astore"="GB";"Diamer"="GB";"Ghanche"="GB";"Ghizer"="GB";"Gilgit"="GB";"Hunza"="GB";"Kharmang"="GB";
  "Nagar"="GB";"Shigar"="GB";"Skardu"="GB";

  "Islamabad Capital Territory"="ICT";
  "Azad Kashmir"="AJK";
}

function Slugify($name) {
  return ($name.ToLower() -replace "[^a-z0-9]+","-").Trim('-')
}

Write-Host "Loading adm2.geojson..."
$adm2 = Get-Content (Join-Path $root "adm2.geojson") -Raw | ConvertFrom-Json

$usedIds = @{}
foreach ($f in $adm2.features) {
  $name = $f.properties.shapeName
  $prov = $provinceMap[$name]
  if (-not $prov) { throw "No province mapping for district: $name" }
  $slug = Slugify $name
  if ($usedIds.ContainsKey($slug)) { $slug = "$slug-$($f.properties.shapeID.Substring(0,4))" }
  $usedIds[$slug] = $true
  $newProps = [ordered]@{ id = $slug; name = $name; province = $prov }
  $f.properties = $newProps
}

Write-Host "Loading adm1.geojson..."
$adm1 = Get-Content (Join-Path $root "adm1.geojson") -Raw | ConvertFrom-Json
foreach ($f in $adm1.features) {
  $name = $f.properties.shapeName
  $newProps = [ordered]@{ id = Slugify $name; name = $name }
  $f.properties = $newProps
}

$outDir = Join-Path (Split-Path -Parent $root) "public\data"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Writing districts.geojson..."
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$districtsJson = $adm2 | ConvertTo-Json -Depth 12 -Compress
[System.IO.File]::WriteAllText((Join-Path $outDir "districts.geojson"), $districtsJson, $utf8NoBom)

Write-Host "Writing provinces.geojson..."
$provincesJson = $adm1 | ConvertTo-Json -Depth 12 -Compress
[System.IO.File]::WriteAllText((Join-Path $outDir "provinces.geojson"), $provincesJson, $utf8NoBom)

Write-Host "Done. District count: $($adm2.features.Count), Province count: $($adm1.features.Count)"
