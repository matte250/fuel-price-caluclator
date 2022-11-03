$PSDefaultParameterValues = @{ '*:Encoding' = 'utf-16' }

Write-Host "Evaluating ports"

$busyPorts = 
    Get-NetTCPConnection 
    | Where-Object {
       ($_.Localport -eq 9000 -or  $_.Localport -eq 8085  -or $_.Localport -eq 5000  -or $_.Localport -eq 4400 -or $_.Localport -eq 4500 -or $_.Localport -eq 4000)
    }
    | Select-Object -Property OwningProcess, ProcessName -Unique
    | ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess
        $_.ProcessName = $process.ProcessName
        $_
    }

if ($busyPorts.Count -gt 0){
    Write-Error "Cannot start services because of ports being occupied by the following processes.."
    Format-List -InputObject $busyPorts
    $confirm = Read-Host "Kill processes? (y/n)"
    if($confirm -eq 'y'){
        $busyPorts | ForEach-Object {(Stop-Process -Id $_.OwningProcess)}
    } else {
        Exit
    }
}

& firebase emulators:start

 


