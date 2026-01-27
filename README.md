# Ops Copilot 🛠️

A lightweight, offline network troubleshooting assistant for network operations teams. Optimized for Cisco Catalyst 9300/9300X, Nexus 9K, and Catalyst 9800 environments.

## What It Does

Ops Copilot helps network engineers streamline incident response and configuration review workflows by:

- **Intelligent Evidence Suggestions**: Automatically recommends relevant show commands based on symptoms (e.g., detects "wifi" keywords and suggests wireless-specific commands)
- **Smart Interface Parsing**: Understands various interface formats (`gi1/0/24`, `g 1/0/24`, `te 2/0/4`, `po-2`) and normalizes them
- **Environment-Aware**: Adapts recommendations based on device role (Access/Core/WLC) and detected keywords
- **Offline Analysis**: Provides preliminary analysis of command outputs without requiring external APIs
- **AI Prompt Generation**: Creates structured prompts optimized for LLM-based troubleshooting
- **Evidence Worksheets**: Generates formatted templates for collecting diagnostic information

### Key Features

#### Incident Analysis
- Auto-detects issue types from natural language symptoms (connectivity, WiFi, DHCP, DNS, latency, etc.)
- Suggests platform-appropriate commands for Cat9300/9300X, Nexus9K, and Cat9800 WLC
- Generates evidence collection worksheets with pre-populated commands
- Performs basic offline analysis of show command outputs
- Auto-redacts IPs and email addresses for data sanitization
- Creates AI-ready prompts for deeper analysis

#### Configuration Review
- Generates structured prompts for configuration audits
- Provides templates for security and best practice analysis
- Supports multiple device types (Access, Core, WLC)

## How to Run It Locally

### Requirements
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No internet connection required
- No installation needed

### Steps

1. **Download the files** to a folder on your computer:
   - `index.html`
   - `ops-copilot-working-fixed.js`
   - `README.md` (optional)

2. **Open the tool**:
   - Simply double-click `index.html`, OR
   - Right-click `index.html` → "Open with" → Choose your browser

3. **Start using it**:
   - The tool runs entirely in your browser
   - No data is sent to external servers
   - All processing happens locally on your machine

## Safety & Privacy

✅ **100% Offline** - No external API calls, no data transmission  
✅ **Safe for Sanitized Data** - Built for working with redacted/sanitized network information  
✅ **Auto-Redaction** - Optional automatic redaction of IPs and email addresses  
✅ **Browser-Only** - Runs entirely in JavaScript, no server required  

⚠️ **Important**: Always sanitize sensitive data (hostnames, IP addresses, passwords) before using this tool, even though it's offline.

## Basic Usage

### Incident Analysis Workflow

1. **Select Incident Type** (Connectivity, Performance, Wireless, etc.)
2. **Choose Device Role** (Access/Core/WLC)
3. **Describe Symptoms** - Use natural language:
   - "Users can't connect to WiFi"
   - "Internet is slow, Teams keeps dropping"
   - "Link keeps flapping on gi1/0/24"
4. **Get Smart Suggestions** - Click "Suggest Evidence Commands"
   - Tool auto-detects keywords and recommends relevant commands
   - Adapts to device type (IOS-XE vs NX-OS vs WLC)
5. **Insert Worksheet** - Click "Insert Evidence Worksheet"
   - Creates a formatted template in the Evidence Collection box
6. **Paste Command Outputs** - Run suggested commands and paste results
7. **Analyze Offline** - Click "Offline Analysis" for preliminary insights
8. **Generate AI Prompt** - Create a structured prompt for LLM analysis

### Config Review Workflow

1. **Select Device Type** (Cat9300, Nexus9K, Cat9800)
2. **Describe Intent** - What the device should do
3. **Paste Config** - Sanitized running-config or snippets
4. **Generate Prompt** - Creates AI-ready review request

### Example: WiFi Troubleshooting

**Input:**
- Type: Wireless Issues
- Role: Wireless (Catalyst 9800)
- Symptoms: "Users in conference room can't connect to WiFi, keep getting authentication errors"

**Output (Suggested Commands):**
```
# WLC (Catalyst 9800)
show wlan summary
show ap summary
show ap dot11 5ghz summary
show client summary
show mobility summary
show ap name <AP-NAME> config general
show ap name <AP-NAME> auto-rf 5ghz
show ap name <AP-NAME> client count
show wireless client mac <CLIENT-MAC> detail
show wireless stats client detail <CLIENT-MAC>
```

The tool detects "authentication errors" and includes auth-specific commands automatically.

## Supported Platforms

- **Access Layer**: Catalyst 9300, 9300X (IOS-XE)
- **Core/Aggregation**: Nexus 9000 Series (NX-OS)
- **Wireless**: Catalyst 9800 Series WLC
- **Access Points**: Catalyst 9100 Series (9120, 9130, 9136, 9166)

## Tips & Tricks

- **Interface Format**: Use any format you're comfortable with:
  - `gi1/0/24`, `g 1/0/24`, `GigabitEthernet1/0/24` all work
  - `te 2/0/4`, `TenGigabitEthernet2/0/4` both recognized
  - `po2`, `po-2`, `port-channel 2` all normalized to `Po2`

- **Auto-Update**: Enable "Auto-update suggestions as I type" to see recommendations refresh as you add details

- **Keyword Detection**: The tool understands natural language:
  - "slow" → suggests bandwidth/latency commands
  - "flapping" → suggests error counters and interface logs
  - "wifi" → switches to wireless-specific commands
  - "dhcp" → adds DHCP snooping and pool commands

- **Multi-Issue**: For complex issues, the tool detects multiple symptom types and combines relevant commands

## Changelog

### v1.0.0 (2026-01-27)
- Initial release
- Incident analysis with smart evidence suggestions
- Configuration review prompt generation
- Support for Cat9300/9300X, Nexus9K, Cat9800
- Interface normalization (gi, te, po formats)
- Environment-aware command suggestions
- Offline analysis capability
- Auto-redaction (IPs, emails)
- Evidence worksheet generation
- AI prompt templates
- Fully offline operation
- No external dependencies

---

## Contributing

This is a static HTML/JS tool. To modify:

1. Edit `index.html` for UI changes
2. Edit `ops-copilot-working-fixed.js` for logic changes
3. Test by refreshing the browser

## License

MIT License - Free to use and modify for your team's needs.

## Support

For issues or feature requests, please contact your team's tool maintainer or refer to your organization's internal documentation.

---

**Made with ❤️ for Network Operations Teams**
