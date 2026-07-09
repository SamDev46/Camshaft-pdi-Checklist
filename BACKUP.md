# Database Backup Guide

## Recommended Frequency
- **Daily**: Full schema and data export during off-peak hours.

## Exporting Data (Oracle Data Pump)
Execute this on the database server to backup the schema:
```bash
expdp system/password@DB schemas=camtrace_user directory=BACKUP_DIR dumpfile=camtrace_backup_%U.dmp logfile=camtrace_backup.log
```

## Restoring Data
To restore a backup into a fresh environment:
```bash
impdp system/password@DB schemas=camtrace_user directory=BACKUP_DIR dumpfile=camtrace_backup_01.dmp logfile=camtrace_restore.log
```
