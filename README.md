# nvda-indent-nav-accessibility README

VSCode extension that improves accessibility of NVDA IndentNav add-on.
[Extension page](https://marketplace.visualstudio.com/items?itemName=TonyMalykh.nvda-indent-nav-accessibility).
This add-on is for visually impaired people that use [NVDA screenreader](https://www.nvaccess.org/download/) in conjunction with [IndentNav add-on](https://github.com/mltony/nvda-indent-nav/) version 2.0 or later.
As of 2024, builtin VSCode accessibility only exposes 500 lines of code via accessibility API.
This extension serves as an enhanced accessibility API and exposes the entire file being edited to screenreaders.
This extension creates a named pipe and acts as a server communicating with clients via JSON.

## Requirements

This extension only works with NVDA add-on IndentNav version 2.0 or later.

## Debugging
To verify that the extension works as expected, check if it creates a named pipe by opening powershell and typing:
```
[System.IO.Directory]::GetFiles("\\.\\pipe\\") | Where-Object { $_.StartsWith("\\.\\pipe\\VSCodeIndentNavBridge") }
```
If command output is not empty, this means that extension has loaded successfully, created a named pipe and ready to listen to incoming connections from NVDA IndentNav add-on v2.0 or later.

## Release Notes

### 1.0.0

Initial release.
