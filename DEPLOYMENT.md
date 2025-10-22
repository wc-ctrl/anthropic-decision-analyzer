# Deployment Instructions

## 🚀 Your Anthropic Decision Analysis Platform is now running!

### Access Your Application

**Local Access:** http://localhost:3002

The application is now containerized and running in OrbStack with Docker.

### Container Status

```bash
# Check if running
docker ps | grep anthropic-decision-analyzer

# View logs
docker logs anthropic-decision-analyzer

# Stop the application
docker-compose down

# Start the application
docker-compose up -d
```

### Configuration

To use the AI features, you'll need to set your Anthropic API key:

1. **Option 1: Environment Variable**
   ```bash
   export NEXT_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here
   docker-compose down && docker-compose up -d
   ```

2. **Option 2: Update .env.local**
   ```bash
   # Edit the .env.local file with your actual API key
   echo "NEXT_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here" > .env.local
   # Then rebuild and restart
   docker-compose down
   docker build -t anthropic-decision-analyzer .
   docker-compose up -d
   ```

### Features Available

✅ **Decision Analysis Mode**: Analyze decision consequences
✅ **Forecast Analysis Mode**: Explore causal pathways
✅ **Interactive Node Editing**: Modify, add, delete nodes
✅ **Live AI Commentary**: Real-time analysis updates
✅ **Professional Interface**: Executive-ready design

### Network Access

The application is accessible on your local network at:
- Internal: http://localhost:3002
- External: http://[your-ip]:3002 (if firewall allows)

### Troubleshooting

**Port conflicts?** Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3003:3000"  # Change 3002 to 3003 or any available port
```

**Need to rebuild?**
```bash
docker-compose down
docker build -t anthropic-decision-analyzer .
docker-compose up -d
```

---

🎉 **You're all set!** Your decision analysis platform is ready for executive use.