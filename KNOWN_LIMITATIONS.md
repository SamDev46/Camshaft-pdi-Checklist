# Known Limitations

1. **Photo Upload Limitations**: Photos are currently stored as BLOBs directly in Oracle. Extremely high volume photo uploads may cause database bloat. Size is hard-limited to 10MB.
2. **Single Session**: Refresh tokens are not implemented. Users will be logged out when their JWT expires (default 8 hours).
3. **Network Dependency**: The application requires a stable internal network. It natively detects offline states and prevents crashes, but offline-caching for inspections is not supported.
