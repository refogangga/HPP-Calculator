$targetPath = "C:\Users\refog\.gemini\config\mcp_config.json"
$config = @{
    mcpServers = @{
        notebooks = @{
            command = "C:\laragon\bin\nodejs\node-v18\node.exe"
            args = @(
                "c:\Users\refog\.antigravity-ide\extensions\googlecloudtools.datacloud-0.6.1-universal\mcp_servers\cli\mcp_proxy_bundle.js"
                "notebooks-antigravityide"
            )
        }
        visualization = @{
            command = "C:\laragon\bin\nodejs\node-v18\node.exe"
            args = @(
                "c:\Users\refog\.antigravity-ide\extensions\googlecloudtools.datacloud-0.6.1-universal\mcp_servers\cli\mcp_proxy_bundle.js"
                "visualization-antigravityide"
            )
        }
    }
}
$config | ConvertTo-Json -Depth 5 | Set-Content -Path $targetPath -Encoding utf8
Write-Output "Successfully updated mcp_config.json!"
