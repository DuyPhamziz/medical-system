Set-Location D:\medical-system\backend
$pid = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Write-Output "Stopping process $pid"; Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }
Write-Output "Building..."
.\mvnw -DskipTests clean package
if ($LASTEXITCODE -ne 0) { Write-Output "Maven build failed with exit code $LASTEXITCODE"; exit 1 }
$jar = Get-ChildItem -Path target -Filter '*.jar' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $jar) { Write-Output "No jar found in target/"; exit 1 }
Write-Output "Starting jar $($jar.Name)"
Start-Process -FilePath 'java' -ArgumentList "-jar", $jar.FullName -WindowStyle Hidden
Write-Output "Waiting for server to start..."
Start-Sleep -Seconds 15
Write-Output "Port check:"; Test-NetConnection -ComputerName localhost -Port 8080 | Select-Object -Property TcpTestSucceeded, RemoteAddress, RemotePort | Format-List

# API test sequence
$email = "apitest" + [int](Get-Date -UFormat %s) + "@example.com"
Write-Output "Email: $email"
$registerBody = @{ username='API Test'; email=$email; password='TestPass123'; role='PATIENT' } | ConvertTo-Json
Write-Output 'POST /api/auth/register'
try { $reg = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/register -ContentType 'application/json' -Body $registerBody -ErrorAction Stop; Write-Output ('REGISTER_OK ' + ($reg | ConvertTo-Json -Compress)) } catch { if ($_.Exception.Response) { $r = $_.Exception.Response; $sr = New-Object System.IO.StreamReader($r.GetResponseStream()); $text = $sr.ReadToEnd(); Write-Output ('REGISTER_ERR_STATUS ' + $r.StatusCode.value__); Write-Output ('REGISTER_ERR_BODY ' + $text) } else { Write-Output ('REGISTER_ERR ' + $_.Exception.Message) } }
Start-Sleep -Seconds 2
Write-Output 'POST /api/auth/login'
$loginBody = @{ email=$email; password='TestPass123' } | ConvertTo-Json
try { $login = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login -ContentType 'application/json' -Body $loginBody -ErrorAction Stop; Write-Output ('LOGIN_OK ' + ($login | ConvertTo-Json -Compress)); $token = $login.accessToken } catch { if ($_.Exception.Response) { $r = $_.Exception.Response; $sr = New-Object System.IO.StreamReader($r.GetResponseStream()); $text = $sr.ReadToEnd(); Write-Output ('LOGIN_ERR_STATUS ' + $r.StatusCode.value__); Write-Output ('LOGIN_ERR_BODY ' + $text) } else { Write-Output ('LOGIN_ERR ' + $_.Exception.Message) } ; exit 0 }
Start-Sleep -Seconds 1
Write-Output 'GET /api/patient-profiles/me'
try { $me = Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/patient-profiles/me -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop; Write-Output ('ME_OK ' + ($me | ConvertTo-Json -Compress)) } catch { if ($_.Exception.Response) { $r = $_.Exception.Response; $sr = New-Object System.IO.StreamReader($r.GetResponseStream()); $text = $sr.ReadToEnd(); Write-Output ('ME_ERR_STATUS ' + $r.StatusCode.value__); Write-Output ('ME_ERR_BODY ' + $text) } else { Write-Output ('ME_ERR ' + $_.Exception.Message) } }
Start-Sleep -Seconds 1
Write-Output 'PUT /api/patient-profiles/me (update)'
$update = @{ HoTen='API Test Updated'; NgaySinh='1990-01-01'; GioiTinh='Nam'; DanToc='Kinh'; QuocTich='Việt Nam'; SoDienThoaiCaNhan='0900000000'; Email=$email; DiaChiHienTai='Hanoi'; HoTenNguoiLienHe='Người liên hệ'; MoiQuanHe='Anh'; SoDienThoaiNguoiLienHe='0911111111'; NgheNghiep='Kỹ sư'; NoiLamViec='Cty' } | ConvertTo-Json
try { $upd = Invoke-RestMethod -Method Put -Uri http://localhost:8080/api/patient-profiles/me -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $update -ErrorAction Stop; Write-Output ('UPDATE_OK ' + ($upd | ConvertTo-Json -Compress)) } catch { if ($_.Exception.Response) { $r = $_.Exception.Response; $sr = New-Object System.IO.StreamReader($r.GetResponseStream()); $text = $sr.ReadToEnd(); Write-Output ('UPDATE_ERR_STATUS ' + $r.StatusCode.value__); Write-Output ('UPDATE_ERR_BODY ' + $text) } else { Write-Output ('UPDATE_ERR ' + $_.Exception.Message) } }
