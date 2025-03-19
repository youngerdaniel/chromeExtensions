document.getElementById("export").addEventListener("click", () => {
    const button = document.getElementById("export");
    button.disabled = true;
    button.textContent = "Exporting...";

    const ttlSetting = document.getElementById("ttl").value;

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractZoneRecords,
            args: [ttlSetting] // Pass TTL setting to the function
        }, (results) => {
            if (chrome.runtime.lastError || !results || !results[0]) {
                console.error("Error: Could not retrieve data or results undefined.");
                showError("Failed to export DNS records");
                return;
            }
            
            const zoneData = results[0].result;
            if (!zoneData) {
                showError("No DNS records found to export");
                return;
            }

            const fullData = '; Zone file exported for Cloudflare\n' + zoneData;
            const blob = new Blob([fullData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            const domain = getDomainFromZoneData(zoneData);
            const date = new Date().toISOString().split('T')[0];
            const filename = `${domain}_zone_${date}.txt`;

            chrome.downloads.download({
                url: url,
                filename: filename
            }, () => {
                button.textContent = "Export Complete!";
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = "Export to BIND Format";
                }, 2000);
            });
        });
    });
});

function showError(message) {
    const button = document.getElementById("export");
    button.textContent = message;
    button.style.backgroundColor = '#ffebee';
    setTimeout(() => {
        button.disabled = false;
        button.textContent = "Export to BIND Format";
        button.style.backgroundColor = '';
    }, 3000);
}

function getDomainFromZoneData(zoneData) {
    const domainMatch = zoneData.match(/Domain:\s+([^\n]+)/);
    return domainMatch ? domainMatch[1].replace(/\.$/, '') : 'zone';
}

// Update extractZoneRecords to accept TTL parameter
function extractZoneRecords(customTTL) {
    const domain = window.location.hostname.replace(/^[^.]+\./g, '');
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    
    // Header template
    const header = `;;
;; Domain:     ${domain}
;; Exported:   ${date}
;;
;; This file is intended for use for informational and archival
;; purposes ONLY and MUST be edited before use on a production
;; DNS server.  In particular, you must:
;;   -- update the SOA record with the correct authoritative name server
;;   -- update the SOA record with the contact e-mail address information
;;   -- update the NS record(s) with the authoritative name servers for this domain.
;;
;; For further information, please consult the BIND documentation
;; located on the following website:
;;
;; http://www.isc.org/
;;
;; And RFC 1035:
;;
;; http://www.ietf.org/rfc/rfc1035.txt
;;
;; Please note that we do NOT offer technical support for any use
;; of this zone data, the BIND name server, or any other third-party
;; DNS software.
;;
;; Use at your own risk.\n`;

    const table = document.querySelector("table.table");
    if (!table) {
        console.error("DNS records table not found");
        return "";
    }

    // Initialize record groups
    const recordGroups = {
        SOA: [],
        NS: [],
        A: [],
        CNAME: [],
        MX: [],
        SRV: [],
        TXT: []
    };

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
            let name = cells[0].textContent.trim();
            // Use custom TTL if specified, otherwise use original
            let ttl = customTTL !== "0" ? customTTL : (cells[1].textContent.trim() || "3600");
            const type = cells[2].textContent.trim();
            const recordData = cells[3].textContent.trim();

            // Ensure name ends with a dot
            name = name.endsWith('.') ? name : name + '.';

            // Process different record types
            switch (type) {
                case "A":
                    recordGroups.A.push(`${name}\t${ttl}\tIN\t${type}\t${recordData}`);
                    break;
                case "CNAME":
                    const target = recordData.endsWith(".") ? recordData : recordData + ".";
                    recordGroups.CNAME.push(`${name}\t${ttl}\tIN\t${type}\t${target}`);
                    break;
                case "MX":
                    const priorityMatch = recordData.match(/Priority:\s*(\d+)/);
                    const destMatch = recordData.match(/Destination:\s*([^\n]+)/);
                    if (priorityMatch && destMatch) {
                        const priority = priorityMatch[1];
                        const destination = destMatch[1].trim();
                        const mxTarget = destination.endsWith(".") ? destination : destination + ".";
                        recordGroups.MX.push(`${name}\t${ttl}\tIN\t${type}\t${priority} ${mxTarget}`);
                    }
                    break;
                case "TXT":
                    if (name.includes('_domainkey')) {
                        // Special handling for DKIM records
                        // Remove any existing quotes and clean up whitespace
                        const cleanDkim = recordData.replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
                        
                        // Split into chunks of 255 characters
                        const maxChunkSize = 255;
                        const chunks = [];
                        let position = 0;
                        
                        while (position < cleanDkim.length) {
                            if (position > 0) {
                                // Add a space before each chunk except the first one
                                chunks.push(' ');
                            }
                            const chunk = cleanDkim.substr(position, maxChunkSize);
                            chunks.push(`"${chunk}"`);
                            position += maxChunkSize;
                        }
                        
                        recordGroups.TXT.push(`${name}\t${ttl}\tIN\t${type}\t${chunks.join('')}`);
                    } else {
                        // Regular TXT record handling
                        const cleanTxt = recordData.replace(/^["']|["']$/g, '').replace(/"/g, '\\"');
                        recordGroups.TXT.push(`${name}\t${ttl}\tIN\t${type}\t"${cleanTxt}"`);
                    }
                    break;
                case "SRV":
                    const srvPriority = recordData.match(/Priority:\s*(\d+)/)?.[1] || "0";
                    const srvWeight = recordData.match(/Weight:\s*(\d+)/)?.[1] || "0";
                    const srvPort = recordData.match(/Port:\s*(\d+)/)?.[1] || "0";
                    const srvTarget = recordData.match(/Target:\s*([^\n]+)/)?.[1].trim();
                    if (srvTarget) {
                        const target = srvTarget.endsWith(".") ? srvTarget : srvTarget + ".";
                        recordGroups.SRV.push(`${name}\t${ttl}\tIN\t${type}\t${srvPriority} ${srvWeight} ${srvPort} ${target}`);
                    }
                    break;
            }
        }
    });

    // Combine all records with section headers
    const sections = [
        header,
        ";; SOA Record",
        recordGroups.SOA.join('\n'),
        "\n;; NS Records",
        recordGroups.NS.join('\n'),
        "\n;; A Records",
        recordGroups.A.join('\n'),
        "\n;; CNAME Records",
        recordGroups.CNAME.join('\n'),
        "\n;; MX Records",
        recordGroups.MX.join('\n'),
        "\n;; SRV Records",
        recordGroups.SRV.join('\n'),
        "\n;; TXT Records",
        recordGroups.TXT.join('\n')
    ];

    return sections.filter(section => section && !section.endsWith("Records\n")).join('\n');
}