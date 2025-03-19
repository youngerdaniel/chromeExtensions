# cPanel Zone Records Exporter

## Overview

The **cPanel Zone Records Exporter** is a Chrome extension designed to simplify the process of exporting DNS zone records from cPanel in BIND format. This tool is particularly useful for users who need to migrate DNS records to Cloudflare or other DNS providers. It allows you to extract DNS records directly from a cPanel interface and download them as a `.txt` file in the BIND zone file format.

---

## Features

- **Export DNS Records**: Extract DNS zone records from cPanel and save them in BIND format.
- **Custom TTL Settings**: Choose between using the original TTL values or overriding them with custom TTL values (e.g., 1 minute, 30 minutes).
- **User-Friendly Interface**: Simple and intuitive popup interface for quick access.
- **Automatic Filename Generation**: The exported file is automatically named based on the domain and the current date.

---

## Use Case

This extension is ideal for:

- **Migrating DNS Records**: When transferring DNS records from cPanel to Cloudflare or other DNS providers.
- **Backup and Archival**: Creating backups of DNS zone records for archival purposes.
- **Editing Zone Files**: Exporting zone files for manual editing before deploying them to a production DNS server.

---

## How It Works

1. **Install the Extension**: Add the extension to your Chrome browser.
2. **Open the cPanel DNS Zone Editor**: Navigate to the DNS Zone Editor page also know as Zone Records for {specific domain} in your cPanel account.
3. **Launch the Extension**: Click on the extension icon in the Chrome toolbar to open the popup.
4. **Select TTL Setting**: Choose whether to use the original TTL values or override them with a custom TTL.
5. **Export Records**: Click the "Export to BIND Format" button. The extension will extract the DNS records and download them as a `.txt` file.

---

## File Structure

The extension contains the following files:

- **`manifest.json`**: Defines the extension's metadata, permissions, and behavior.
- **`popup.html`**: The user interface for the extension's popup.
- **`popup.js`**: The JavaScript logic for extracting DNS records and handling user interactions.
- **`icon.png`**: The icon displayed for the extension in the Chrome toolbar.

---

## Permissions

The extension requires the following permissions:

- **`activeTab`**: To interact with the currently active tab in the browser.
- **`scripting`**: To inject scripts into the active tab for extracting DNS records.
- **`downloads`**: To save the exported DNS zone file to the user's computer.
- **`host_permissions`**: Allows the extension to access all websites (`*://*/`) to ensure compatibility with cPanel interfaces.

---

## How to Install

1. Clone or download the repository containing the extension files.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top-right corner.
4. Click **Load unpacked** and select the folder containing the extension files.
5. The extension will now appear in your Chrome toolbar.

---

## How to Use

1. Navigate to the **DNS Zone Editor** page in your cPanel account. You must be on the specific page for the domain you are working on or else this will not work.
2. Click the extension icon in the Chrome toolbar to open the popup.
3. Select a **TTL Setting** from the dropdown menu:
   - **Use Original TTL**: Retains the TTL values from the DNS records.
   - **1 Minute**: Overrides TTL values to 60 seconds.
   - **30 Minutes**: Overrides TTL values to 1800 seconds.
4. Click the **Export to BIND Format** button.
5. The extension will extract the DNS records and download a `.txt` file containing the zone data.

---

## Notes

- The exported zone file includes a header with important instructions for editing the file before using it on a production DNS server.
- The extension automatically ensures that DNS record names and targets are properly formatted (e.g., ensuring trailing dots for fully qualified domain names).
- There might be a need to double check the DKIM records if any due to new line formatting and chunking issues. This is set to chunk to 255 characters by default.

---

## Troubleshooting

- **No DNS Records Found**: Ensure you are on the DNS Zone Editor page in cPanel. The extension relies on the presence of a specific table structure to extract records.
- **Export Button Disabled**: Wait for the current export process to complete before attempting another export.
- **Incorrect File Format**: Verify that the DNS records in cPanel are correctly formatted and supported by the extension.

---

## License

This extension is provided as-is for informational and archival purposes. Use at your own risk. The authors are not responsible for any issues arising from the use of this extension.

---

## Disclaimer

This extension is not affiliated with or endorsed by cPanel, Cloudflare, or any other DNS provider. It is an independent tool created to assist me in managing my DNS records because I often find myself doing a lot of migrations.

---
