from __future__ import annotations

"""
Standard Library Imports

This module provides commonly used Python standard library imports
across the Forge WebUI codebase.
"""

# Standard Library Imports (High Frequency)
import os
import sys
import json
import re
import logging
import html
import importlib
import datetime
import inspect
import threading
import time
import math
import traceback
import hashlib
import dataclasses
import io
import argparse
import csv
import platform
import contextlib
import warnings
import functools
import subprocess
import collections
import base64

# Optional imports that may not be available
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    psutil = None
    PSUTIL_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    requests = None
    REQUESTS_AVAILABLE = False

# Common from imports
from pathlib import Path
from contextlib import closing
from collections import namedtuple, defaultdict
from functools import wraps
from urllib.parse import urlparse
from dataclasses import dataclass

__all__ = [
    # Core modules
    'os', 'sys', 'json', 're', 'logging', 'html', 'importlib',
    'datetime', 'inspect', 'threading', 'time', 'math', 'traceback',
    'hashlib', 'dataclasses', 'io', 'argparse', 'csv', 'platform',
    'contextlib', 'warnings', 'functools', 'subprocess', 'collections', 'base64',

    # Optional modules
    'psutil', 'requests',

    # From imports
    'Path', 'closing', 'namedtuple', 'defaultdict', 'wraps',
    'urlparse', 'dataclass',

    # Availability flags
    'PSUTIL_AVAILABLE', 'REQUESTS_AVAILABLE'
]
