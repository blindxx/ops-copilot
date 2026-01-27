# Ops Copilot 🛠️
🔗 **Live Tool:** https://blindxx.github.io/ops-copilot/

A lightweight, offline network troubleshooting assistant that generates smart diagnostic commands and AI-ready prompts for Cisco environments.

## What is Ops Copilot?

Ops Copilot is a browser-based troubleshooting assistant built for network operations teams.  
It translates plain-language symptoms into smart Cisco diagnostic commands and structured AI prompts.

It helps you:

- Turn user complaints into targeted CLI commands  
- Collect organized troubleshooting evidence  
- Perform basic offline analysis  
- Generate clean summaries for tickets or escalation  
- Create AI-ready prompts for deeper investigation  

No installation required. No data leaves your browser.

## Who Should Use This?

Designed for:

- Network Engineers  
- NOC Technicians  
- IT Support Teams  
- Anyone troubleshooting Cisco wired or wireless networks  

Optimized for:

- Catalyst 9300 / 9300X  
- Nexus 9000  
- Catalyst 9800 WLC  


## Quick Start

1. **Online**: Visit https://blindxx.github.io/ops-copilot/
2. **Offline**: Download the files and open `index.html` in any browser

No installation required. Works 100% offline.

## What It Does

**Incident Analysis:**
- Enter symptoms in plain language (e.g., "WiFi keeps dropping", "slow internet")
- Get intelligent command suggestions based on keywords and device type
- Auto-generates evidence collection worksheets
- Performs basic offline analysis of command outputs
- Creates structured AI prompts for deeper troubleshooting

**Config Review:**
- Paste sanitized configs
- Generate AI-ready prompts for security and best practice analysis

## Key Features

✅ **Smart Detection** - Understands natural language ("flapping", "can't connect", "slow")  
✅ **Platform-Aware** - Adapts to Cat9300/9300X, Nexus9K, or Cat9800 WLC  
✅ **Interface Parsing** - Handles `gi1/0/24`, `te 2/0/4`, `po-2` formats  
✅ **Offline Analysis** - Basic diagnostics without external APIs  
✅ **Auto-Redaction** - Sanitizes IPs and emails  
✅ **100% Offline** - No data leaves your browser  

## Example Workflow

1. User says: *"WiFi keeps dropping and Teams disconnects."*  
2. Enter symptoms → Click **Suggest Evidence Commands**  
3. Run commands on device → Paste output into Evidence box  
4. Click **Offline Analysis**  
5. Click **Generate Output Shell**  
6. Paste output into a ticket or share with AI for deeper help  


## Usage Example

**Input:**
```
Type: Wireless Issues
Symptoms: "Users in conference room can't connect to WiFi, authentication errors"
Device: Catalyst 9800 WLC
```

**Output:**
```
# Auto-suggested commands
show wlan summary
show wireless client summary
show ap summary
show wireless client mac <MAC> detail
show radius server-group detail
# ... and more
```

The tool detects "authentication" and automatically includes auth-specific commands.

## Supported Platforms

- **Access**: Catalyst 9300, 9300X (IOS-XE)
- **Core**: Nexus 9000 Series (NX-OS)  
- **Wireless**: Catalyst 9800 WLC
- **APs**: Catalyst 9100 Series

## Privacy & Security

- 100% client-side JavaScript - no server communication
- Safe for sanitized/redacted data
- Auto-redaction available for IPs and emails
- No data storage or tracking

## Tips

- **Auto-update**: Enable "Auto-update suggestions" to see recommendations refresh as you type
- **Multiple symptoms**: Tool detects multiple issue types and combines relevant commands
- **Any interface format**: `gi1/0/24`, `g 1/0/24`, `GigabitEthernet1/0/24` all work

---

**Made for Network Operations Teams**
## Change Log

### v0.9 – Jan 2026
- Restored advanced evidence detection logic  
- Fixed Suggest Evidence button wiring  
- Fixed Generate Output Shell after Offline Analysis  
- Added role-aware deep-dive detection (DHCP, DNS, M365, flapping, auth)  
- Improved wireless and login troubleshooting suggestions  

