const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const { db } = require('../../handlers/db.js');
const { isUserAuthorizedForContainer } = require('../../utils/authHelper');

// Helper: Get plugins dir for an instance (adjust to your volume structure if needed)
function getPluginsDir(instance) {
  // If you use docker volumes or mapped paths, adjust this accordingly
  return path.join('/srv/instances', instance.Id, 'plugins');
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
    const pluginsDir = getPluginsDir(instance);
    let files = await fs.readdir(pluginsDir, { withFileTypes: true });
    let plugins = [];
    for (let file of files) {
      if (file.isFile() && file.name.endsWith('.jar')) {
        // Optionally extract plugin info from jar manifest (advanced)
        plugins.push({ name: file.name.replace(/\.jar$/, ''), version: '', file: file.name });
      }
    }
    res.json(plugins);
  } catch (e) {
    res.json([]);
  }
});

// Download plugin from Spiget and save to plugins folder
router.post('/instance/:id/plugins/install', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
  const { id } = req.params;
  const { pluginId } = req.body;
  if (!pluginId) return res.status(400).json({ error: 'No pluginId provided.' });
  let instance = await db.get(id + '_instance');
  if (!instance) return res.status(404).json({ error: 'Instance not found.' });
  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).json({ error: 'Unauthorized' });

  try {
    // Get plugin info from Spiget
    const infoRes = await fetch(`https://api.spiget.org/v2/resources/${pluginId}`);
    const pluginInfo = await infoRes.json();
    const downloadRes = await fetch(`https://api.spiget.org/v2/resources/${pluginId}/download`);
    if (!downloadRes.ok) throw new Error('Failed to download');
    const pluginsDir = getPluginsDir(instance);
    // Ensure plugins directory exists
    await fs.mkdir(pluginsDir, { recursive: true });
    // Save file
    const filePath = path.join(pluginsDir, `${pluginInfo.name || pluginId}.jar`);
    const out = await fs.open(filePath, 'w');
    await downloadRes.body.pipeTo(out.createWriteStream());
    await out.close();
    res.json({ ok: true, file: path.basename(filePath) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Remove a plugin (.jar)
router.delete('/instance/:id/plugins/remove', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
  const { id } = req.params;
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'No file specified.' });
  let instance = await db.get(id + '_instance');
  if (!instance) return res.status(404).json({ error: 'Instance not found.' });
  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).json({ error: 'Unauthorized' });

  try {
    const pluginsDir = getPluginsDir(instance);
    const filePath = path.join(pluginsDir, file);
    await fs.unlink(filePath);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Main Plugin Manager UI
router.get('/instance/:id/plugins', async (req, res) => {
  if (!req.user) return res.redirect('/login');
  const { id } = req.params;
  let instance = await db.get(id + '_instance');
  if (!instance) return res.redirect('/instances');
  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).send('Unauthorized');
  res.render('instance/pluginmanager', {
    req,
    instance,
    activeTab: 'plugins',
    user: req.user
  });
});

module.exports = router;
