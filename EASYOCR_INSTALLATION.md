# EasyOCR Installation Guide

To enable Python-based EasyOCR as a backup OCR solution, you need to install Python and EasyOCR on your system.

## Prerequisites

1. **Python 3.6 or higher** - Download from [python.org](https://www.python.org/downloads/)
2. **pip** - Usually comes with Python installation

## Installation Steps

### 1. Install Python
- Visit [https://www.python.org/downloads/](https://www.python.org/downloads/)
- Download and install the latest Python version for your operating system
- Make sure to check "Add Python to PATH" during installation (Windows)

### 2. Verify Python Installation
Open a terminal/command prompt and run:
```bash
python --version
# or
python3 --version
```

You should see output like `Python 3.x.x`

### 3. Install EasyOCR
```bash
pip install easyocr
```

### 4. Install Additional Dependencies (for PDF processing)
```bash
pip install pdf2image
```

You might also need to install Poppler for PDF to image conversion:
- **Windows**: Download from [poppler.freedesktop.org](https://poppler.freedesktop.org/) and add to PATH
- **macOS**: `brew install poppler`
- **Linux**: `sudo apt-get install poppler-utils` (Ubuntu/Debian) or equivalent

### 5. Test EasyOCR
Create a simple test script to verify the installation:

```python
import easyocr

# Initialize reader
reader = easyocr.Reader(['en'])

# Test with a simple image
# result = reader.readtext('path/to/your/image.png')
# print(result)
```

## How It Works in This Project

The CV ATS Checker will automatically detect if Python and EasyOCR are available. If they are, EasyOCR will be used as a backup OCR solution when Tesseract.js fails.

The detection happens in this order:
1. Standard PDF text extraction
2. Tesseract.js OCR (primary)
3. Python EasyOCR (backup, if available)
4. OCR.Space API (final fallback)

## Troubleshooting

### Python Not Found
- Make sure Python is added to your system PATH
- Try using `python3` instead of `python` on some systems

### EasyOCR Installation Issues
- Try: `pip install --upgrade pip` then `pip install easyocr`
- On some systems, you might need: `pip3 install easyocr`

### PDF Processing Issues
- Make sure Poppler is installed and added to PATH
- On Windows, you might need to restart your terminal/command prompt after installing Poppler

## Security Note

The Python integration creates temporary files for processing. These files are automatically cleaned up after processing, but make sure your temporary directory is secure.