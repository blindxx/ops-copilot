console.log("WORKING.JS LOADED ✅");


// ==========================================================
// Interface parsing helpers (symptoms / optional interface)
// Normalizes: "gi 2/0/4", "g1/0/24", "int te 2/0/4", "po-2", "port-channel 2"
// into IOS-style short form: Gi2/0/4, Te2/0/4, Po2
// ==========================================================
function normalizeIfc(raw) {
  if (!raw) return "";
  let x = String(raw).trim();

  // Common prefixes people type
  x = x.replace(/^\s*(?:int(?:erface)?|interface)\s+/i, "");

  // Normalize separators
  x = x.replace(/\s+/g, " ").trim();

  // Canonicalize "port-channel"
  x = x.replace(/\bport-channel\b/i, "po");

  // Match: gi1/0/24, gi 1/0/24, g1/0/24, te 1/1/1, tengig1/1/1, fa0/1, po1, po-1, po 1
  const m = x.match(/^(gi|g|te|tengig|fa|po)\s*-?\s*([\d/]+)$/i);
  if (!m) return "";

  let prefix = m[1].toLowerCase();
  let body = m[2];

  // Fix up prefix casing + aliases
  if (prefix === "g") prefix = "gi";
  if (prefix === "tengig") prefix = "te";

  const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1); // Gi/Te/Fa/Po

  // Remove any stray spaces/hyphens inside body
  body = body.replace(/\s+/g, "").replace(/-/g, "");

  return cap + body;
}

function extractIfcFromText(text) {
  if (!text) return "";
  const t = String(text);

  // Best-effort interface token from free-form text, then normalize it.
  // Catches: "gi1/0/24", "g 1/0/24", "te 1/1/1", "tengig1/1/1", "po1", "po-2",
  // and prefixed forms: "int te 2/0/4", "interface gi 1/0/24", "port-channel 2"
  const m = t.match(/\b(?:(?:interface|int)\s+)?(?:gi|g|gig|gigabitethernet|te|tengig|tengigabitethernet|fa|fastethernet|po|port-?channel|portchannel)\s*-?\s*[\d/]+\b/i);
  if (!m) return "";

  // Strip any leading "int"/"interface"
  const raw = m[0].replace(/^\s*(?:int(?:erface)?|interface)\s+/i, "");
  return normalizeIfc(raw);
}
//============================================================
//debug
//===========================================================
let DEBUG = false;
if (DEBUG) console.log("something");
 
if (DEBUG) {
  // debug banner code
}

	

// ==========================================================
// SCRIPT: OPS COPILOT MINI MVP (OFFLINE)
// - No external APIs
// - Safe for sanitized data
// - Optimized for Cat9300/9300X + Nexus9K + Catalyst 9800
// ==========================================================
  // ==========================================================
// JS SECTION: TAB SWITCHING
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const tabIncident = document.getElementById('tabIncident');
  const tabConfig   = document.getElementById('tabConfig');
  const tabGuide    = document.getElementById('tabGuide');
  const panelIncident = document.getElementById('panelIncident');
  const panelConfig   = document.getElementById('panelConfig');
  const panelGuide    = document.getElementById('panelGuide');
 
  function activate(which){
    const isIncident = (which === 'incident');
    const isConfig = (which === 'config');
    const isGuide = (which === 'guide');
    
    tabIncident.classList.toggle('active', isIncident);
    tabConfig.classList.toggle('active', isConfig);
    tabGuide.classList.toggle('active', isGuide);
    
    panelIncident.style.display = isIncident ? 'block' : 'none';
    panelConfig.style.display   = isConfig ? 'block' : 'none';
    panelGuide.style.display    = isGuide ? 'block' : 'none';
  }
  tabIncident.addEventListener('click', () => activate('incident'));
  tabConfig.addEventListener('click', () => activate('config'));
  tabGuide.addEventListener('click', () => activate('guide'));
  });
 
// ==========================================================
// JS SECTION: HELPERS (toast, download, redaction)
// ========================================================== 
  // ---------- Toast ----------
  function getToast(){
  return document.getElementById('toast');
  }
 
  function showToast(msg="Copied!"){
  const toast = getToast();
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 1100);
}
 
  // ---------- Download helper ----------
  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
 
  // ---------- Redaction helpers ----------
  function redact(text){
    if(!text) return "";
    text = text.replace(/\b(\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]");
    text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]");
    return text;
  }

 // ==========================================================
// JS SECTION: EVIDENCE SUGGESTIONS (env-aware)
// ==========================================================
function evidenceSuggestions(incidentType, symptomsText, envText, role, iface){
  const sRaw = (symptomsText || "");
  const s = sRaw.toLowerCase();
  const env = (envText || "").toLowerCase();
  // Normalize dropdown incident type (your HTML uses lowercase values)
	const typeNorm = String(incidentType || "").toLowerCase();
	const isWirelessType = typeNorm === "wireless";
	const isWiredType = typeNorm === "wired" || typeNorm === "connectivity";
	const isDhcpType = typeNorm === "dhcp";
	const isOtherType = typeNorm === "other";

  // --- IP hint extractor (first IPv4 in symptoms) ---
  let ipHint = "";
  {
    const m = s.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/);
    if (m) ipHint = m[0];
  }

  // Prefer explicit iface; fall back to parsing from symptoms/env
  let ifc = normalizeIfc(iface) || extractIfcFromText(symptomsText) || extractIfcFromText(envText);

  // Infer role if notes hint at it
  let effectiveRole = role || "access";
  if (/nexus|n9k|nx-?os/.test(env)) effectiveRole = "core";
  if (/9800|wlc/.test(env)) effectiveRole = "wlc";

  // --- End-user friendly keyword detection ---
  const hasLink = /link|down|updown|unplugged|cable|errdisable|udld|line protocol|notconnect|not connect/.test(s);

  // Flapping / intermittent
  const hasFlap = /flap|flapping|bounce|bouncing|up\/down|up down|disconnect(ing)?|drops|keeps dropping|intermittent/.test(s);

  // Slow / lag / loss
  const hasSlow = /slow|sluggish|lag|latency|delay|buffer|buffering|choppy|stutter|packet loss|loss|timeouts?|timing out/.test(s);

  // No internet / offline
  const hasNoInternet = /no internet|internet down|offline|can'?t reach|can'?t load|websites? (won't|cant|cannot) load|no connection|connected but no internet|no connectivity/.test(s);

  // DHCP-ish
  const hasDhcp = /dhcp|apipa|169\.254|self[- ]assigned|limited (connectivity)?|no ip|missing ip|can'?t get (an )?ip|renew|lease/.test(s);

  // DNS-ish
  const hasDns  = /dns|name resolve|cannot resolve|can'?t resolve|nxdom|servfail|lookup|site not found|address not found|could not find host/.test(s);

  // WiFi-ish
  const hasWifi = /wifi|wireless|ssid|roam|ap\b|hotspot|signal|bars|connected to wifi|wifi connected|wifi keeps|keeps disconnecting|drops? (often|constantly)?|can'?t connect to wifi|unable to connect|weak signal|poor signal|auth(entication)?|802\.1x|radius|eap|password|wrong password/.test(s);

  // Printing-ish
  const hasPrint = /can'?t print|cannot print|printing|printer|print queue|stuck printing|printer offline|offline printer|spooler/.test(s);

  // Loop/STP-ish
  const hasLoop = /loop|broadcast|storm|spanning|stp|bpdu|topology change|tcn/.test(s);

  // Auth/login-ish (kept broad; we also expose "login/auth" as a simpler bucket)
  const hasAuth = /802\.1x|dot1x|eap|radius|auth failed|authentication failed|can'?t authenticate|wrong password|keeps asking for password/.test(s);
  const hasLogin = /can'?t login|cannot login|login failed|password|auth failed|authentication failed|802\.1x|dot1x|radius|eap/.test(s);

  // VPN-ish
  const hasVpn = /vpn|anyconnect|secure client|globalprotect|pulse secure|forticlient|tunnel|ipsec|ssl vpn|split tunnel/.test(s);

  // M365 / Teams / Outlook / OneDrive
  const hasM365 = /teams|outlook|office 365|o365|microsoft 365|m365|onedrive|sharepoint/.test(s);

  // App-specific bucket (kept for backwards compat)
  const hasTeamsOutlook = /teams|outlook|o365|office 365|microsoft 365|onedrive|sharepoint|zoom|webex/.test(s);

  // Variants/synonyms visibility (so humans can see what was detected)
  const detected = [];
  if (hasNoInternet) detected.push("no internet/offline");
  if (hasWifi) detected.push("wifi/wireless");
  if (hasLink) detected.push("link/down");
  if (hasFlap) detected.push("flapping/intermittent");
  if (hasSlow) detected.push("slow/latency/loss");
  if (hasDhcp) detected.push("dhcp/no ip");
  if (hasDns) detected.push("dns/resolve");
  if (hasPrint) detected.push("printing");
  if (hasLoop) detected.push("stp/loop");
  if (hasVpn) detected.push("vpn");
  if (hasM365) detected.push("m365");
  if (hasLogin || hasAuth) detected.push("login/auth");

  let out = [];
  out.push(`Detected from symptoms: ${detected.length ? detected.join(", ") : "(none)"}`);
  out.push("");

  out.push("=== Assumed environment ===");
  out.push("Access/IDF: Catalyst 9300/9300X (IOS-XE)");
  out.push("Core/Root:  Nexus 9000 (NX-OS)");
  out.push("Wireless:   Catalyst 9800 (IOS-XE)");
  out.push("APs:        CW9166D1-B / C9130AX / CW91661-B");
  out.push(`Selected role: ${effectiveRole}${ifc ? " | Interface: " + ifc : ""}`);
  out.push("");

  // ===== Segment 8.1: Role-based baseline evidence (when symptoms are generic) =====
  const genericSymptoms = s.trim().length < 25 || /^help|issue|problem|down|not working|trouble/i.test(s.trim());
  if (genericSymptoms) {
    out.push("=== Baseline evidence by role ===");

    if (effectiveRole === "access") {
      out.push("Access (assume Catalyst 9300/9300X):");
      out.push("show interface status");
      out.push("show vlan brief");
      out.push("show ip interface brief");
      out.push("show logging | last 60");
      out.push("");
      if (ifc) {
        out.push(`show interface ${ifc}`);
        out.push(`show interface ${ifc} switchport`);
        out.push(`show interface ${ifc} counters errors`);
        out.push(`show authentication sessions interface ${ifc} details`);
        out.push("");
      }
    }

    if (effectiveRole === "core") {
      out.push("Core (assume Nexus 9000):");
      out.push("show ip interface brief");
      out.push("show ip route summary");
      out.push("show arp summary");
      out.push("show logging last 80");
      out.push("");
    }

    if (effectiveRole === "wlc") {
      out.push("Wireless (assume Cisco 9800 WLC):");
      out.push("show wireless client summary");
      out.push("show ap summary");
      out.push("show wlan summary");
      out.push("show logging | last 80");
      out.push("");
    }
  }

  out.push("=== Baseline (always useful) ===");
  out.push("show logging | last 80");
  out.push("show interfaces status");
  out.push("show interface counters errors");
  out.push("");

  // --- Role-aware deepening for "no internet" ---
  if (hasNoInternet) {
    out.push("=== User reports 'No Internet / Offline' ===");

    if (effectiveRole === "access") {
      out.push("Access switch deep-dive (Cat9300/9300X):");
      out.push("show interface status");
      if (ifc) {
        out.push(`show interface ${ifc}`);
        out.push(`show interface ${ifc} switchport`);
        out.push(`show interface ${ifc} counters errors`);
        out.push(`show authentication sessions interface ${ifc} details`);
      }
      out.push("show vlan brief");
      out.push("show ip dhcp snooping binding");
      out.push("");
    }

    if (effectiveRole === "core") {
      out.push("Core deep-dive (Nexus 9K):");
      out.push("show ip route <client-ip>");
      out.push("show ip route <dns-server-ip>");
      out.push("show ip arp | i <client-ip>");
      out.push("show ip arp | i <default-gateway-ip>");
      out.push("");
    }

    if (effectiveRole === "wlc") {
      out.push("Wireless deep-dive (9800 WLC):");
      out.push("show wireless client summary");
      out.push("show ap summary");
      out.push("show logging | last 200 | i CAPWAP|DTLS|join|disassoc|deauth|EAP|RADIUS");
      out.push("Tip: start 'last 200'. Earlier today: 'last 1000'. Yesterday: remove 'last' + filter hard.");
      out.push("");
    }

    out.push("ping <default-gateway> repeat 20");
    out.push("ping 1.1.1.1 repeat 20");
    out.push("ping 8.8.8.8 repeat 20");
    out.push("traceroute 8.8.8.8");
    out.push("nslookup google.com <dns-server>");
    out.push("show ip route | i 0.0.0.0");
    out.push("");
  }

  // --- M365 / Teams / Outlook / OneDrive ---
  if (hasM365) {
    out.push("=== M365 issues (Teams/Outlook/O365/OneDrive) ===");
    out.push("This often points to DNS/proxy/routing/policy more than a physical link issue.");
    out.push("");

    out.push("Client checks:");
    out.push("- Is it only one user or many users?");
    out.push("- Does web browsing work normally?");
    out.push("- Wired vs Wi-Fi difference?");
    out.push("- Capture exact error message + timestamp");
    out.push("");

    out.push("Quick network tests:");
    out.push("ping <default-gateway> repeat 20");
    out.push("ping 1.1.1.1 repeat 20");
    out.push("ping 8.8.8.8 repeat 20");
    out.push("traceroute 8.8.8.8");
    out.push("nslookup teams.microsoft.com <dns-server>");
    out.push("nslookup outlook.office.com <dns-server>");
    out.push("nslookup login.microsoftonline.com <dns-server>");
    out.push("");

    out.push("Device-side evidence:");
    out.push("show ip route | i 0.0.0.0");
    out.push("show logging | last 80");
    out.push("");
  }

  // --- Login/Auth/802.1X (wired or wireless) ---
  if (hasLogin || hasAuth) {
    out.push("=== Login / Authentication (802.1X / RADIUS / Wi-Fi password) ===");
    out.push("Goal: determine user-specific vs widespread auth-path issue.");
    out.push("");

    out.push("Fast questions (saves time):");
    out.push("- One user or many users?");
    out.push("- Wired only, Wi-Fi only, or both?");
    out.push("- Exact error text + timestamp (very important)");
    out.push("");

    out.push("Switch-side evidence (Cat9300/9300X):");
    out.push("show authentication sessions");
    if (ifc) out.push(`show authentication sessions interface ${ifc} details`);
    out.push("show logging | i dot1x|mab|radius|eap|auth|aaa|failed");
    out.push("");

    out.push("If Wi-Fi is involved (WLC 9800):");
    out.push("show wireless client summary");
    out.push("show logging | i EAP|RADIUS|AAA|deauth|disassoc|auth|failed");
    out.push("");

    out.push("Likely causes:");
    out.push("- Bad credentials / account lockout (user-specific)");
    out.push("- RADIUS/ISE unreachable or slow (many users)");
    out.push("- VLAN/SGT/policy mismatch after auth");
    out.push("- Cert/EAP mismatch (esp. after changes)");
    out.push("");
  }

  // --- VPN ---
  if (hasVpn) {
    out.push("=== VPN issues ===");
    out.push("Client checks:");
    out.push("- Can you browse normal sites without VPN?");
    out.push("- Is VPN failing to connect OR connects but no access?");
    out.push("- Capture exact error message");
    out.push("");

    out.push("Network checks:");
    out.push("ping 8.8.8.8 repeat 20");
    out.push("nslookup vpn.<domain> <dns-server>");
    out.push("traceroute <vpn-gateway>");
    out.push("show logging | i vpn|ipsec|ssl|anyconnect");
    out.push("");
  }

  // --- App bucket + user says offline (kept) ---
  if (hasTeamsOutlook && hasNoInternet) {
    out.push("=== App issues (Teams/Outlook/O365) + user says offline ===");
    out.push("This often points to DNS/proxy/routing rather than link down.");
    out.push("nslookup teams.microsoft.com <dns-server>");
    out.push("nslookup outlook.office.com <dns-server>");
    out.push("traceroute 8.8.8.8");
    out.push("");
  }

  // --- Printing ---
  if (hasPrint) {
    out.push("=== User reports 'Can't Print / Printer Offline' ===");
    out.push("");

    out.push("Client checks (quick):");
    out.push("- Confirm printer name + location (which device?)");
    out.push("- Confirm printer IP/hostname if known");
    out.push("- Try ping <printer-ip> from an affected client");
    out.push("- Windows: check print queue; clear stuck jobs; restart Print Spooler if needed");
    out.push("- If printing works from some VLANs but not others: likely ACL/VLAN/routing/policy");
    out.push("");

    out.push("Network checks (switch/WLC):");
    out.push("- Identify printer port: MAC table / ARP / DHCP reservations (if any)");
    out.push("- Validate VLAN + port mode + port-security + STP state");
    out.push("");

    out.push("Catalyst access switch evidence:");
    out.push("show arp | i " + (ipHint || "<printer-ip>"));
    out.push("show mac address-table | i <printer-mac>");
    out.push("show interface status | i <printer-port>");
    out.push("show logging | i SECURE|PORT_SECURITY|ERRDISABLE|LINK|UPDOWN");

    if (ifc) {
      out.push(`show interface ${ifc}`);
      out.push(`show interface ${ifc} switchport`);
      out.push(`show interface ${ifc} counters errors`);
      out.push(`show interface ${ifc} transceiver detail`);
      out.push(`show authentication sessions interface ${ifc} details`);
    }

    if (effectiveRole === "core") {
      out.push("");
      out.push("Nexus core checks (if printer VLAN is routed here):");
      out.push("show ip arp | i " + (ipHint || "<printer-ip>"));
      out.push("show mac address-table | i <printer-mac>");
      out.push("show interface status");
      out.push("show logging last 100");
    }

    out.push("");
    out.push("Common causes to confirm:");
    out.push("- Printer got a new IP (DHCP change) but clients still pointing to old one");
    out.push("- VLAN mismatch or trunk/native mismatch on printer port");
    out.push("- Port-security / 802.1X/MAB blocking the printer");
    out.push("- Link errors on the printer port (CRC, duplex, bad cable)");
    out.push("- Routing/ACL policy between client VLAN and printer VLAN");
    out.push("");
  }

  // Quick interface-specific add-ons
  if (ifc) {
    out.push(`show interface ${ifc}`);
    out.push(`show interface ${ifc} counters errors`);
  }
  if (hasSlow) out.push("ping <default-gateway> repeat 50");
  out.push("");

  // Wired evidence: Catalyst
	if ((isWiredType || isOtherType) && effectiveRole === "access") {
    out.push("=== Wired / Catalyst 9300/9300X (IOS-XE) ===");
    out.push("show interfaces | i line protocol|error|CRC|input errors|output errors");
    if (hasLink) out.push("show logging | i LINK|UPDOWN|ERRDISABLE|UDLD");
    out.push("show etherchannel summary");
    if (hasLoop) out.push("show spanning-tree detail | i ieee|occurr|from|tc|topology");
    out.push("show mac address-table move update");
    if (ifc) {
      out.push(`show interface ${ifc} switchport`);
      out.push(`show interface ${ifc} transceiver detail`);
    }
    out.push("show platform hardware fed active fwd-asic drops");
    out.push("");
  }

  // Wired evidence: Nexus 9K
  if ((incidentType === "Wired" || incidentType === "Other") && effectiveRole === "core") {
    out.push("=== Wired / Nexus 9000 (NX-OS) ===");
    out.push("show interface status");
    out.push("show logging last 100");
    out.push("show port-channel summary");
    out.push("show spanning-tree summary");
    if (hasLoop) out.push("show spanning-tree detail | i tc|topology|occurr|from");
    if (ifc) {
      out.push(`show interface ${ifc}`);
      out.push(`show interface ${ifc} counters errors`);
      out.push(`show interface ${ifc} transceiver details`);
    }
    out.push("");
  }

  // Wireless evidence: 9800 WLC
	if (isWirelessType || hasWifi || effectiveRole === "wlc") {
    out.push("=== Wireless / Catalyst 9800 WLC (IOS-XE) ===");
    out.push("show ap summary");
    out.push("show ap join stats summary");
    out.push("show wireless client summary");
    out.push("show wireless client errors");
    out.push("show logging | i CAPWAP|DTLS|join|disassoc|deauth|EAP|RADIUS");
    out.push("show platform software status control-processor brief");
    out.push("show processes cpu | ex 0.00");

    if (hasDhcp) out.push("show wireless client mac <client-mac> detail  (if known)");
    out.push("If you know client details (recommended):");
    out.push("- Client MAC");
    out.push("- SSID/WLAN name");
    out.push("- AP name (if known)");
    out.push("");

    out.push("Client-specific deep dive (if MAC known):");
    out.push("show wireless client mac <client-mac>");
    out.push("show wireless client mac <client-mac> detail");
    out.push("show logging | i <client-mac>");
    out.push("");

    out.push("AP-focused deep dive (if AP name known):");
    out.push("show ap name <ap-name> config general");
    out.push("show ap name <ap-name> ethernet statistics");
    out.push("");
    out.push("");
  }

  // Flapping / intermittent connectivity evidence (link/AP/client)
  if (hasFlap) {
    out.push("=== Flapping / Intermittent connectivity (link/AP/client) ===");
    out.push("Goal: prove frequency + pattern + where it breaks (client, access port, uplink, AP join).");
    out.push("");

    out.push("Access switch checks (Cat9300/9300X):");
    if (ifc) {
      out.push(`show interface ${ifc}`);
      out.push(`show interface ${ifc} switchport`);
      out.push(`show interface ${ifc} counters errors`);
      out.push(`show interface ${ifc} transceiver detail  (if fiber/SFP)`);
      out.push(`show authentication sessions interface ${ifc} details`);
      out.push(`show logging | last 200 | i ${ifc}|UPDOWN|LINK|LINEPROTO|ERRDISABLE`);
      out.push("Tip: start with 'last 200'. Earlier today: 'last 1000'. Yesterday: remove 'last' + filter hard.");
      out.push("");
    } else {
      out.push("show logging | last 200 | i UPDOWN|LINK|LINEPROTO|ERRDISABLE");
      out.push("Tip: start with 'last 200'. Earlier today: 'last 1000'. Yesterday: remove 'last' + filter hard.");
      out.push("Tip: enter interface (Gi1/0/24) to make this sharper.");
      out.push("");
    }

    out.push("show interface status | i (notconnect|err|down)");
    out.push("");

    const isWirelessFlap = (incidentType === "Wireless") || hasWifi || (effectiveRole === "wlc");
    if (isWirelessFlap) {
      out.push("Wireless/AP checks (9800 WLC) if involved:");
      out.push("show logging | last 200 | i CAPWAP|DTLS|join|disassoc|deauth|timeout|reboot");
      out.push("Tip: start 'last 200'. Earlier today: 'last 1000'. Yesterday: remove 'last' + filter hard.");
      out.push("show ap summary");
      out.push("show ap join stats summary");
      out.push("");
    }

    out.push("Likely causes:");
    out.push("- Bad cable / bad SFP / dirty fiber / loose patch");
    out.push("- PoE instability (AP rebooting)");
    out.push("- Port-security / errdisable events");
    out.push("- STP or LACP instability on uplinks");
    out.push("");
  }

  // WAN/ISP
  if (incidentType === "WAN/ISP") {
    out.push("=== WAN / Edge evidence ===");
    out.push("show ip interface brief");
    out.push("show interface <wan-interface>");
    out.push("show ip route | i 0.0.0.0");
    out.push("show logging | i BGP|OSPF|LINEPROTO|LINK");
    out.push("traceroute 8.8.8.8");
    out.push("ping 8.8.8.8 repeat 50");
    out.push("");
  }

  // DHCP/DNS (with role-aware deepening)
	if (isDhcpType || hasDhcp || hasDns) {
    out.push("=== DHCP / DNS evidence ===");

    if (hasDhcp || incidentType === "DHCP/DNS") {
      out.push("check DHCP scope utilization (% used)");
      out.push("client test: ipconfig /all (Windows) OR ip a (Linux/mac)");
      out.push("switch: show ip dhcp snooping binding (if enabled)");

      // Role-aware deepening for DHCP
      if (effectiveRole === "access") {
        out.push("Access DHCP checks (Cat9300/9300X):");
        if (ifc) {
          out.push(`show interface ${ifc}`);
          out.push(`show interface ${ifc} switchport`);
          out.push(`show interface ${ifc} counters errors`);
          out.push(`show authentication sessions interface ${ifc} details`);
        }
        out.push("show ip dhcp snooping binding");
        out.push("show logging | i DHCP|SNOOP|ARP|IPDT");
        out.push("");
      }

      if (effectiveRole === "core") {
        out.push("Core DHCP path checks (Nexus 9K):");
        out.push("show ip route " + (ipHint || "<dhcp-server-ip>"));
        out.push("show ip arp | i " + (ipHint || "<dhcp-server-ip>"));
        out.push("show ip arp | i <default-gateway-ip>");
        out.push("Check SVI + helper-address on client VLAN (if applicable).");
        out.push("");
      }

      if (effectiveRole === "wlc") {
        out.push("Wireless DHCP checks (9800 WLC):");
        out.push("show wireless client summary");
        out.push("show logging | i DHCP|client|timeout|ip");
        out.push("");
      }
    }

    if (hasDns || incidentType === "DHCP/DNS") {
      // Role-aware deepening for DNS
      if (effectiveRole === "access") {
        out.push("Access switch DNS-related checks (Cat9300/9300X):");
        if (ifc) {
          out.push(`show interface ${ifc}`);
          out.push(`show interface ${ifc} switchport`);
          out.push(`show interface ${ifc} counters errors`);
        }
        out.push("show ip dhcp snooping binding");
        out.push("show logging | i DHCP|SNOOP|ARP|DNS");
        out.push("");
      }

      if (effectiveRole === "core") {
        out.push("Core DNS path checks (Nexus 9K):");
        out.push("show ip route " + (ipHint || "<dns-server-ip>"));
        out.push("show ip arp | i " + (ipHint || "<dns-server-ip>"));
        out.push("show ip arp | i <default-gateway-ip>");
        out.push("");
      }

      if (effectiveRole === "wlc") {
        out.push("Wireless DNS path checks (9800 WLC):");
        out.push("show wireless client summary");
        out.push("show logging | i DHCP|DNS|client|timeout");
        out.push("");
      }

      out.push("nslookup <known-site> <dns-server>");
      out.push("nslookup <internal-host> <dns-server>");
      out.push("ping <dns-server> repeat 20");
    }

    out.push("");
  }

  out.push("=== What to look for ===");
  out.push("CRC/input errors climbing = optic/fiber/physical layer issue");
  out.push("LINK up/down repeats or UDLD/errdisable = unstable link or neighbor mismatch");
  out.push("STP topology changes storm = loop");
  out.push("Many clients fail DHCP = scope exhaustion or relay/path issue");
  out.push("CAPWAP/DTLS/AP join failures = VLAN/DHCP/cert/path issue");
  return out.join("\n");
}

 // ==========================================================
// JS SECTION: OFFLINE ANALYSIS (rule-based triage)
// ==========================================================

  function offlineAnalyze(incidentType, symptoms, evidence){
    const text = ((symptoms || "") + "\n" + (evidence || "")).toLowerCase();
    const sig = (re) => re.test(text);
 
    const s_crc = sig(/\bcrc\b|input errors|output errors|giant|runts|fcs/i);
    const s_link = sig(/%link-|updown|changed state to down|line protocol.*down|errdisable|udld/i);
    const s_stp = sig(/topology change|tcn|spanning-tree|stp|root.*changed/i);
    const s_lacp = sig(/etherchannel|port-channel|lacp|pagg|bundle/i);
    const s_dhcp = sig(/dhcp|dora|lease|apipa|169\.254|no address|discover|offer/i);
    const s_dns  = sig(/dns|nslookup|servfail|nxdom|cannot resolve|name resolution/i);
	const s_vpn   = sig(/vpn|anyconnect|secure client|globalprotect|tunnel|ipsec|ssl vpn/i);
	const s_m365  = sig(/teams|outlook|office 365|o365|microsoft 365|m365|onedrive|sharepoint/i);
	const s_login = sig(/can'?t login|cannot login|login failed|password|auth failed|authentication failed|802\.1x|dot1x|radius|eap/i);
   	const s_offline = sig(/no internet|internet down|offline|connected but no internet|can'?t load|no connection|limited connectivity/i);
	const s_print   = sig(/can'?t print|cannot print|printer offline|print queue|spooler|printing/i);
	const s_wlc  = sig(/capwap|dtls|deauth|disassoc|eap|802\.1x|radius|aaa|wlc|join/i);
    const s_auth = sig(/eap|802\.1x|radius|aaa|authentication failed|failed.*auth/i);
    const s_cpu  = sig(/high cpu|cpu|queue|drops|overutil/i);
    const s_poepower = sig(/power inline|poe|inline power|power denied|ilpower/i);
    const s_mtu  = sig(/mtu|fragment|too big|df set/i);
    const s_isp  = incidentType === "WAN/ISP" || sig(/bgp|ospf|pppoe|circuit|provider|isp/i);
 
    const causes = [];
    function addCause(title, why, score){ causes.push({title, why, score}); }
 
    if (s_crc) addCause("Physical layer errors (fiber/optic/cable/SFP)", "CRC / input errors usually point to optic, patch, or cabling issues.", 9);
    if (s_link) addCause("Interface flapping (physical/power/UDLD/errdisable)", "Repeated link up/down or errdisable indicates instability on the port or its neighbor.", 9);
    if (s_poepower) addCause("PoE / power budget or negotiation issue", "PoE events can bounce phones/APs; power denied hints at budget/negotiation.", 7);
    if (s_stp) addCause("Layer-2 loop or STP instability", "Topology change storms / STP churn often mean a loop or miswired edge.", 8);
    if (s_lacp) addCause("Port-channel/LACP inconsistency or member flap", "EtherChannel problems can blackhole traffic or flap if members disagree.", 7);
    if (s_dhcp) addCause("DHCP failure (scope exhaustion/relay/path)", "APIPA/lease failures usually mean DHCP scope, helper/relay, or path issues.", 8);
    if (s_dns) addCause("DNS resolution issue (DNS server reachability or service)", "NSLOOKUP failures suggest DNS reachability/service problems.", 7);
    if (s_vpn)   addCause("VPN issue detected", "Likely upstream reachability, DNS resolution of VPN gateway, or firewall/policy blocking. Confirm if non-VPN internet works.", 3);
	if (s_m365)  addCause("M365 app symptom detected (Teams/Outlook/O365)", "Often DNS/proxy/routing/policy issue. Validate DNS resolution + reachability to Microsoft endpoints.", 2);
	if (s_login) addCause("Login / Authentication issue detected", "Likely 802.1X/RADIUS/auth path issue (wired or wireless). Check auth sessions and RADIUS/WLC logs.", 4);
	if (incidentType === "Wireless" || s_wlc){
    if (s_offline) addCause("User reports 'Offline / No Internet'", "End-user symptom indicator — could be DNS, DHCP, or upstream/WAN. Verify IP/gateway reachability and DNS resolution tests.", 4);
	if (s_print)   addCause("Printing issue (printer offline / can't print)", "Often VLAN/ACL segmentation, printer IP change, port-security/802.1X, or local spooler. Verify ping/ARP/MAC path to printer.", 3);
	  if (s_wlc) addCause("Wireless control-path issue (CAPWAP/DTLS/AP join)", "CAPWAP/DTLS/join errors often mean VLAN/DHCP/cert/path problems.", 8);
      if (s_auth) addCause("802.1X/RADIUS auth failures", "EAP/RADIUS failures indicate AAA policy, cert, or backend reachability.", 7);
    }
    if (s_isp) addCause("WAN routing/transport problem (ISP/circuit/BGP/OSPF)", "Edge routing or provider transport instability can cause widespread impact.", 7);
    if (s_cpu) addCause("Device performance issue (CPU/queue drops)", "High CPU/queues can cause intermittent timeouts and control-plane issues.", 6);
    if (s_mtu) addCause("MTU/fragmentation mismatch", "MTU issues cause weird app failures and some tunnels/WAN problems.", 5);
 
    if (causes.length === 0){
      addCause("Insufficient evidence to narrow down", "Paste interface counters/logs/WLC client or AP join output for better offline triage.", 1);
    }
    causes.sort((a,b)=> b.score - a.score);
 
    const checks = [];
    const addCheck = (x) => checks.push(x);
 
    addCheck("Confirm scope: isolated VLAN/IDF/WLC or widespread?");
    addCheck("Check for recent change/power work around start time.");
 
    if (s_crc || s_link){
      addCheck("Check suspected uplink: show interface <x> ; show interface counters errors");
      addCheck("Check flaps/errdisable: show logging | i LINK|UPDOWN|ERRDISABLE");
      addCheck("If fiber: clean/reseat, swap patch, swap SFP; check DOM if available.");
    }
    if (s_lacp) addCheck("Validate EtherChannel: show etherchannel summary; verify members in-sync.");
    if (s_stp){
      addCheck("Check STP churn: show spanning-tree detail | i tc|topology|occurr");
      addCheck("Look for edge loop; confirm portfast/bpduguard on edge.");
    }
    if (s_dhcp){
      addCheck("Check DHCP scope utilization and free leases.");
      addCheck("Client: ipconfig /all (or ip a) + verify gateway reachability.");
      addCheck("Verify relay/helper-address path; dhcp snooping bindings if used.");
    }
    if (s_dns){
      addCheck("Test DNS reachability: ping DNS server; nslookup known site via DNS server.");
    }
    if (incidentType === "Wireless" || s_wlc){
      addCheck("WLC: show ap summary; show ap join stats summary; show wireless client summary.");
      addCheck("Logs: show logging | i CAPWAP|DTLS|join|deauth|EAP|RADIUS");
    }
    if (s_isp){
      addCheck("Edge: show ip route | i 0.0.0.0 ; show interface <wan-interface>");
      addCheck("Reachability: ping/traceroute 8.8.8.8 (or known upstream).");
    }
 
    const top5 = causes.slice(0,5).map((c,i)=> `- ${i+1}) ${c.title} — ${c.why}`).join("\n");
    const top10 = checks.slice(0,10).map((c,i)=> `- [ ] ${i+1}) ${c}`).join("\n");
 
    const impact = (document.getElementById('incImpact').value.trim() || "users in a limited area");
    const start = (document.getElementById('incStart').value.trim() || "recently");
    const top = causes[0]?.title || "unknown cause";
    const update = `Investigating network issue impacting ${impact} (started ~${start}). Early indicators suggest: ${top}. Next update in 30 minutes.`;
 
    return `OFFLINE TRIAGE (rule-based)\n\n1) Likely causes (ranked)\n${top5}\n\n2) Next checks (top 10)\n${top10}\n\n3) Teams update (draft)\n${update}\n\nNote: Offline triage is heuristic. For higher confidence, use approved AI with the generated prompt.`;
  }
// ==========================================================
// JS SECTION: PROMPT BUILDERS (incident + config)
// ==========================================================
  function buildIncidentPrompt(){
    const type = document.getElementById('incType').value;
    const impact = document.getElementById('incImpact').value.trim() || "(not provided)";
    const start = document.getElementById('incStart').value.trim() || "(not provided)";
    const env = document.getElementById('incEnv').value.trim() || "(none)";
    const symptoms = document.getElementById('incSymptoms').value.trim() || "(not provided)";
    let evidence = document.getElementById('incEvidence').value.trim() || "(not provided)";
    const doRedact = document.getElementById('incRedact').checked;
    if(doRedact) evidence = redact(evidence);
 
    return `You are a senior Network Operations engineer. Help me triage an incident safely.
 
Constraints:
- Do NOT ask for or include sensitive org data.
- Assume any pasted evidence is sanitized.
- Keep output concise and operational.
 
Environment/Notes:
${env}
 
Incident Type: ${type}
Impact/Scope: ${impact}
Start Time: ${start}
 
Symptoms (bullets):
${symptoms}
 
Evidence / logs / command output (sanitized):
${evidence}
 
REQUIRED OUTPUT FORMAT:
1) Likely causes (ranked 1–5). Each: 1-line "why".
2) Next 10 checks as a checklist. Include exact commands where applicable.
3) Draft Teams status update (1–3 sentences) + suggested next update time.`;
  }
 
function incidentShell(offlineText, suggestText, meta) {
  const offline = (offlineText || "").trim();
  const suggest = (suggestText || "").trim();

  const parts = [];

  // Meta header (small + useful)
  if (meta) {
    const { incidentType, role, ifc, started, impact } = meta;
    parts.push("INCIDENT WORKSHEET");
    if (incidentType) parts.push(`Type: ${incidentType}`);
    if (role) parts.push(`Role: ${role}`);
    if (ifc) parts.push(`Suspect interface: ${ifc}`);
    if (impact) parts.push(`Impact: ${impact}`);
    if (started) parts.push(`Started: ${started}`);
    parts.push("");
  }

  // Prefer real offline analysis if available; otherwise show the blank template
  if (offline) {
    parts.push(offline);
  } else {
    parts.push(`1) Likely causes (ranked)
- 1) …
- 2) …
- 3) …
- 4) …
- 5) …

2) Next 10 checks (checklist + commands)
- [ ] 1) …
- [ ] 2) …
- [ ] 3) …
- [ ] 4) …
- [ ] 5) …
- [ ] 6) …
- [ ] 7) …
- [ ] 8) …
- [ ] 9) …
- [ ] 10) …

3) Teams status update (draft)
- Update:
- Next update time:`);
  }

  // Always include suggested commands (since that's the whole point)
  if (suggest) {
    parts.push("");
    parts.push("=== Suggested evidence / commands ===");
    parts.push(suggest);
  }

  return parts.join("\n");
}

 
  // ---------- Config prompt + shell ----------
  function buildConfigPrompt(){
    const type = document.getElementById('cfgType').value;
    const intent = document.getElementById('cfgIntent').value.trim() || "(not provided)";
    let cfg = document.getElementById('cfgText').value.trim() || "(not provided)";
    const doRedact = !!document.getElementById('cfgRedact')?.checked;
    if(doRedact) cfg = redact(cfg);
 
    return `You are a network configuration reviewer. Review the pasted config for risk and correctness.
 
Device type: ${type}
Intended purpose / context:
${intent}
 
Config (sanitized):
${cfg}
 
REQUIRED OUTPUT FORMAT:
A) Findings (High / Medium / Low). Each finding: issue, impact, why it matters.
B) Minimal-change fix suggestions (as small diffs/snippets).
C) Assumptions + 3 questions to confirm intent.`;
  }
 
  function configShell(){
    return `A) Findings
HIGH:
- …
MEDIUM:
- …
LOW:
- …
 
B) Minimal-change fixes (snippets/diffs)
- …
 
C) Assumptions + questions
Assumptions:
- …
Questions:
1) …
2) …
3) …`;
  }
 
  // ==========================================================
// JS SECTION: EVENT LISTENERS / BUTTON WIRING
// ==========================================================
  window.addEventListener("DOMContentLoaded", () => {
    // Incident
	// ==========================================================
// NEW: Auto-regenerate Suggested Evidence when fields change
// ==========================================================
	function autoSetRoleFromIncidentType() {
  const typeEl = document.getElementById("incType");
  const roleEl = document.getElementById("incRole");
  if (!typeEl || !roleEl) return;

  const t = String(typeEl.value || "").toLowerCase();

  // Map Incident Type -> Role
  if (t === "wireless") roleEl.value = "wlc";
  else if (t === "dhcp") roleEl.value = "access"; // usually starts at access; adjust if your core does DHCP
  else if (t === "wired" || t === "connectivity" || t === "performance" || t === "intermittent" || t === "other") roleEl.value = "access";
}
	function refreshEvidenceSuggestions(){
	const auto = document.getElementById("incAutoSuggest")?.checked;
	if (!auto) return;
 
  // Only refresh after user has generated suggestions at least once
  const incSuggestBox = document.getElementById("incEvidenceSuggest");
	if (!incSuggestBox || !incSuggestBox.value.trim()) return;
 
  const t = document.getElementById("incType").value;
  const symptoms = document.getElementById("incSymptoms").value;
  const env = document.getElementById("incEnv").value;
  const role = document.getElementById("incRole").value;
  const iface = document.getElementById("incInterface").value;
 
  incSuggestBox.value = evidenceSuggestions(t, symptoms, env, role, iface);
}
 
// Watch common fields and refresh suggestions automatically
["incType","incSymptoms","incEnv","incRole","incInterface"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", refreshEvidenceSuggestions);
  el.addEventListener("change", refreshEvidenceSuggestions);
  el.addEventListener("paste", () => setTimeout(refreshEvidenceSuggestions, 0));
});
    const incOut = document.getElementById("incOut");
    const incEvidenceBox = document.getElementById("incEvidence");
    const incSuggestBox = document.getElementById("incEvidenceSuggest");
    const incOfflineBox = document.getElementById("incOfflineAnalysis");
	  
	// Auto-set Role based on Incident Type (single source of truth)
function autoSetRoleFromIncidentType() {
  const incTypeEl = document.getElementById("incType");
  const incRoleEl = document.getElementById("incRole");
  if (!incTypeEl || !incRoleEl) return;

  const t = String(incTypeEl.value || "").toLowerCase();
  incRoleEl.value = (t === "wireless") ? "wlc" : "access";

  // Kick existing watchers/listeners (presets/autosuggest rely on these)
  incRoleEl.dispatchEvent(new Event("change", { bubbles: true }));
  incRoleEl.dispatchEvent(new Event("input", { bubbles: true }));
}

// Wire it up: run once on load + whenever Incident Type changes
(() => {
  const incTypeEl = document.getElementById("incType");
  if (!incTypeEl) return;

  autoSetRoleFromIncidentType(); // set immediately on page load
  incTypeEl.addEventListener("change", autoSetRoleFromIncidentType);
})();

 	// ========== Quick Preset Buttons ==========
    const presetText = {
      no_internet: "Users report no internet access. They can't load websites or access cloud services.",
      dhcp: "Devices unable to obtain IP address. Getting APIPA 169.254.x.x addresses or no IP at all.",
      dns: "Can't resolve hostnames. Websites won't load but can ping IP addresses directly.",
      wifi_drop: "WiFi keeps disconnecting. Users connected to WiFi but keeps dropping connection.",
      auth_8021x: "802.1x authentication failures. Users can't authenticate to the network.",
      m365: "Microsoft 365 / Teams / Outlook issues. Applications slow or not connecting.",
      flap_port: "Interface flapping. Link going up and down repeatedly.",
      slow: "Network is slow. High latency, buffering, packet loss reported."
    };
    // Attach listeners to all preset buttons
document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const presetKey = btn.getAttribute('data-preset');
    const text = presetText[presetKey];
    if (!text) return;

    // Fill symptoms box
    const symptomsBox = document.getElementById('incSymptoms');
    if (symptomsBox) symptomsBox.value = text;

    // If auto-suggest is enabled, trigger Suggest Evidence button
    const autoSuggest = document.getElementById('incAutoSuggest')?.checked;
    if (autoSuggest) {
      const suggestBtn = document.getElementById('incSuggestEvidence');
      if (suggestBtn) suggestBtn.click();
    }

    showToast(`Loaded preset: ${presetKey}`);
  });
});

    // Fix: Suggest Evidence Commands button wiring
    const incSuggestBtn = document.getElementById("incSuggestEvidence");
    if (incSuggestBtn) {
      incSuggestBtn.addEventListener("click", () => {
        const t = document.getElementById("incType").value;
        const symptoms = document.getElementById("incSymptoms").value;
        const env = document.getElementById("incEnv").value;
        const roleSel = document.getElementById("incRole").value;
        const ifaceVal = document.getElementById("incInterface").value;
        incSuggestBox.value = evidenceSuggestions(t, symptoms, env, roleSel, ifaceVal);
        showToast("Suggested evidence updated");
      });
    }
	document.getElementById("incMakePrompt").addEventListener("click", () => {
      incOut.textContent = buildIncidentPrompt();
    });
 
    document.getElementById("incMakeShell").addEventListener("click", () => {
	

  btnShell.addEventListener("click", () => {
    const cfg = (cfgTextEl.value || "").trim();

    if (!cfg) {
      setCfgOut("Config Reviewer: No config pasted in #cfgText.");
      return;
    }

    setCfgOut(buildShellFromConfig(cfg));
    showToast("Config Reviewer shell generated");
  });
})();

  const incidentType = (document.getElementById("incType")?.value || "");
  const impact = (document.getElementById("incImpact")?.value || "").trim();
  const started = (document.getElementById("incStart")?.value || "").trim();
  const roleSel = (document.getElementById("incRole")?.value || "");

  const ifaceRaw = (document.getElementById("incInterface")?.value || "");
  const symptomsText = (document.getElementById("incSymptoms")?.value || "");
  const ifc = normalizeIfc(ifaceRaw) || extractIfcFromText(symptomsText);

  const offlineText = (document.getElementById("incOfflineAnalysis")?.value || "");
  const suggestText = (document.getElementById("incEvidenceSuggest")?.value || "");

  incOut.textContent = incidentShell(offlineText, suggestText, {
    incidentType,
    role: roleSel,
    ifc,
    started,
    impact
  });

  showToast("Output shell generated");
});


  document.getElementById("incInsertCommands").addEventListener("click", () => {
  const t = document.getElementById("incType").value;
  const symptoms = document.getElementById("incSymptoms").value;
  const env = document.getElementById("incEnv").value;
  const role = document.getElementById("incRole").value;
  const iface = document.getElementById("incInterface").value;
 
  // Always refresh suggestions so they’re never stale
  incSuggestBox.value = evidenceSuggestions(t, symptoms, env, role, iface);
 
  const d = new Date().toLocaleString();
  const roleLabel =
    role === "core" ? "Core/Root (Nexus 9K)" :
    role === "wlc"  ? "Wireless (Catalyst 9800)" :
                      "Access/IDF (Cat9300/9300X)";
 
  const ifaceLine = iface.trim() ? `\nInterface Focus: ${iface.trim()}` : "";
 
  incEvidenceBox.value =
    (incEvidenceBox.value || "").trimEnd() +
    `\n\n=== Evidence Collection Worksheet (${d}) ===\n` +
    `Incident Type: ${t}\n` +
    `Role: ${roleLabel}${ifaceLine}\n` +
    `Defaults: Access=Cat9300/9300X, Core=Nexus9K, WLC=9800, APs=CW9166D1-B/C9130AX/CW91661-B\n` +
    `\n--- Commands to run ---\n` +
    incSuggestBox.value +
    `\n\n--- Paste results below (sanitized) ---\n`;
 
  showToast("Inserted updated evidence worksheet");
});
 
    document.getElementById("incOfflineAnalyze").addEventListener("click", () => {
      const type = document.getElementById("incType").value;
      const symptoms = document.getElementById("incSymptoms").value;
      let evidence = document.getElementById("incEvidence").value;
      if (document.getElementById("incRedact").checked) {
        evidence = redact(evidence);
      }
      incOfflineBox.value = offlineAnalyze(type, symptoms, evidence);
      showToast("Offline analysis complete");
    });
 
    document.getElementById("incCopyOut").addEventListener("click", async () => {
      await navigator.clipboard.writeText(incOut.textContent);
      showToast("Copied output");
    });
 
    document.getElementById("incDownload").addEventListener("click", () => {
      downloadText("incident_prompt.txt", incOut.textContent);
      showToast("Downloaded incident_prompt.txt");
    });
 
    document.getElementById("incClear").addEventListener("click", () => {
      ["incImpact","incStart","incEnv","incSymptoms","incEvidence"].forEach(id => document.getElementById(id).value = "");
      incSuggestBox.value = "";
      incOfflineBox.value = "";
      incOut.textContent = "(Output will appear here)";
    });
 
    // Config
    const cfgOut = document.getElementById("cfgOut");
 
    document.getElementById("cfgCopyOut").addEventListener("click", async () => {
      await navigator.clipboard.writeText(cfgOut.textContent);
      showToast("Copied output");
    });
 
    document.getElementById("cfgDownload").addEventListener("click", () => {
      downloadText("config_review_prompt.txt", cfgOut.textContent);
      showToast("Downloaded config_review_prompt.txt");
    });
 
    document.getElementById("cfgClear").addEventListener("click", () => {
      ["cfgIntent","cfgText"].forEach(id => document.getElementById(id).value = "");
      cfgOut.textContent = "(Output will appear here)";
    });
  });

 // ================= CONFIG REVIEWER SAFE WIRING =================
// This runs AFTER the page loads and guarantees the buttons work
window.addEventListener("DOMContentLoaded", () => {
  const cfgOut = document.getElementById("cfgOut");
  const btnPrompt = document.getElementById("cfgMakePrompt");
  const btnShell  = document.getElementById("cfgMakeShell");

  if (cfgOut && btnPrompt) {
    btnPrompt.addEventListener("click", () => {
      cfgOut.textContent = buildConfigPrompt();
      showToast("Config prompt generated");
    });
  }

  if (cfgOut && btnShell) {
    btnShell.addEventListener("click", () => {
      cfgOut.textContent = configShell();
      showToast("Config shell generated");
    });
  }
});

