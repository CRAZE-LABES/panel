const express = require('express');
const router = express.Router();
const path = require('path');
const fetch = require('node-fetch');
const { db } = require('../../handlers/db.js');
const { isUserAuthorizedForContainer } = require('../../utils/authHelper');

// Helper: Get plugins dir for an instance (adjust this if needed)
function getPluginsDir(instance) {
    return path.join('plugin');
}

// List installed plugins (.jar files)
router.get('/instance/:id/plugins/installed', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
    const { id } = req.params;
    let instance = await db.get(id + '_instance');
    if (!instance) return res.status(404).json({ error: 'Instance not found.' });
    const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
    if (!isAuthorized) return res.status(403).json({ error: 'Unauthorized' });

    try {
        // TODO: Implement actual plugin file listing from your file server
        res.json([]); // Placeholder
    } catch (e) {
        res.json([]);
    }
});

// Install plugin from Modrinth or Spiget
router.post('/instance/:id/plugins/install', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
    const { id } = req.params;
    let instance = await db.get(id + '_instance');
    if (!instance) return res.status(404).json({ error: 'Instance not found.' });
    const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
    if (!isAuthorized) return res.status(403).json({ error: 'Unauthorized' });

    try {
        // --- Modrinth install ---
        if (req.body.modrinth_id && req.body.modrinth_version) {
            const versionInfoResp = await fetch(`https://api.modrinth.com/v2/version/${req.body.modrinth_version}`);
            if (!versionInfoResp.ok) throw new Error('Failed to get Modrinth version info.');
            const versionInfo = await versionInfoResp.json();
            if (!versionInfo.files || !versionInfo.files[0] || !versionInfo.files[0].url)
                throw new Error('No downloadable file found for this Modrinth version.');
            const downloadUrl = versionInfo.files[0].url;
            const encodedDownloadUrl = encodeURIComponent(downloadUrl);
            const plugin_name = versionInfo.files[0].filename || `${req.body.modrinth_id}.jar`;
            const pluginFileUrl = `http://${instance.Node.address}:${instance.Node.port}/fs/${instance.VolumeId}/files/plugin/${encodedDownloadUrl}/${plugin_name}`;
            return res.json({ ok: true, url: pluginFileUrl, file: plugin_name });
        }

        // --- Spiget/Legacy install (if pluginId is given) ---
        if (req.body.pluginId) {
            const pluginId = req.body.pluginId;
            const infoRes = await fetch(`https://api.spiget.org/v2/resources/${pluginId}`);
            if (!infoRes.ok) throw new Error('Could not fetch plugin info');
            const pluginInfo = await infoRes.json();
            const downloadUrl = `https://api.spiget.org/v2/resources/${pluginId}/download`;
            const encodedDownloadUrl = encodeURIComponent(downloadUrl);
            const plugin_name = `${pluginInfo.name || pluginId}.jar`;
            const pluginFileUrl = `http://${instance.Node.address}:${instance.Node.port}/fs/${instance.VolumeId}/files/plugin/${encodedDownloadUrl}/${plugin_name}`;
            return res.json({ ok: true, url: pluginFileUrl, file: plugin_name });
        }

        res.status(400).send('No plugin source provided.');
    } catch (e) {
        res.status(500).send('Error: ' + e.message);
    }
});

// Remove a plugin (.jar)
router.post('/instance/:id/plugins/remove', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
    // TODO: Implement actual deletion from your file server
    res.json({ ok: true });
});

// Main Plugin Manager UI - With Download Option
router.get('/instance/:id/plugins', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    const { id } = req.params;
    let instance = await db.get(id + '_instance');
    if (!instance) return res.redirect('/instances');
    const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
    if (!isAuthorized) return res.status(403).send('Unauthorized');

    const name = await db.get('name') || 'Craze Panel';
    const logo = await db.get('logo') || '/assets/logo.png';

    // Example plugin list, modify as needed for real plugins and their download/install URLs
    const plugins = [
        {
            name: "ExamplePlugin",
            id: "123",
            downloadUrl: "/plugins/ExamplePlugin.jar",
            installUrl: `/instance/${id}/plugins/install?pluginId=123`
        }
        // Add more plugins as needed
    ];

    res.render('instance/pluginmanager', {
        req,
        user: req.user,
        instance,
        plugins,
        q: req.query.q || "",
        name,
        logo
    });
});

module.exports = router;
