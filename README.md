# nvda-indent-nav-accessibility README

VSCode extension that improves accessibility of NVDA IndentNav add-on.
This add-on is for visually impaired people that use [NVDA screenreader](https://www.nvaccess.org/download/) in conjunction with [IndentNav add-on](https://github.com/mltony/nvda-indent-nav/) version 2.0 or later.
As of 2024, builtin VSCode accessibility only exposes 500 lines of code via accessibility API.
This extension serves as an enhanced accessibility API and exposes the entire file being edited to screenreaders.
This extension creates a named pipe and acts as a server communicating with clients via JSON.

## Requirements

This extension only works with NVDA add-on IndentNav version 2.0 or later.

## Release Notes

### 1.0.0

Initial release.
