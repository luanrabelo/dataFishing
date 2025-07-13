#!/usr/bin/env python3
"""
dataFishing - Legacy script for backward compatibility
For new installations, use: pip install dataFishing
Then run: dataFishing --help
"""

import sys
import warnings

warnings.warn(
    "This script is deprecated. Please install the package with 'pip install dataFishing' "
    "and use the 'dataFishing' command instead.",
    DeprecationWarning,
    stacklevel=2
)

try:
    from dataFishing.cli import main
    main()
except ImportError:
    print("dataFishing package not found. Please install with: pip install dataFishing")
    sys.exit(1)