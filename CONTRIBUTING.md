# Contributing to Claude Session Manager

First off, thank you for considering contributing to csm! It's people like you that make csm such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, shell, bash version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how this enhancement would be used**

### Pull Requests

* Fill in the required template
* Follow the existing code style
* Include comments in your code where necessary
* Update documentation as needed
* Test your changes

## Development Setup

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/claude-session-manager.git
   ```
3. Install locally:
   ```bash
   cd claude-session-manager
   LOCAL_INSTALL=1 ./install.sh
   ```
4. Make your changes
5. Test with:
   ```bash
   ./src/csm.sh --help
   ./src/csm.sh list
   ```
6. Run shellcheck:
   ```bash
   shellcheck src/**/*.sh install.sh
   ```

## Code Style

* Use POSIX-compatible shell syntax when possible
* Use functions for reusable code
* Add comments for complex logic
* Use meaningful variable names
* Handle errors gracefully

### Shell Style Guide

```bash
# Function naming: lowercase with underscores
cmd_list() {
    local variable="$1"
    # ...
}

# Error handling
if [ ! -f "$file" ]; then
    die "File not found: $file"
fi

# Use local variables
local my_var="value"
```

## Testing

Before submitting a PR, please:

1. Run shellcheck on all shell files
2. Test all affected commands manually
3. Verify the help text is accurate

## Documentation

* Update README.md for user-facing changes
* Update inline comments for code changes
* Keep examples up to date

## Questions?

Feel free to open an issue with the "question" label if you have any questions about contributing.
