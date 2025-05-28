// /routes/dashboard/unzip.js (or similar)

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { isUserAuthorizedForContainer } = require("../../utils/authHelper");

router.get("/instance/:id/files/unzip/:file", async (req, res) => {
  const { id, file } = req.params;
  const filePath = req.query.path || ""; // optional ?path=/folder

  try {
    // 🔍 1. Get instance info
    const instance = await db.get("SELECT * FROM instances WHERE id = ?", [id]);
    if (!instance) return res.status(404).send("Instance not found");

    // 🔐 2. Authorization check
    if (!isUserAuthorizedForContainer(req.user.userId, instance)) {
      return res.status(403).send("Not authorized");
    }

    // ⛔ 3. Check suspension
    if (instance.suspended) {
      req.flash("error", "Instance is suspended.");
      return res.redirect("/dashboard/instances");
    }

    // ⚙️ 4. Ensure Daemon config exists
    if (!instance.VolumeId || !instance.Node?.address || !instance.Node?.apiKey) {
      return res.status(500).send("Node configuration missing");
    }

    // 📡 5. Call the Daemon
    const apiURL = `http://${instance.Node.address}:${instance.Node.port}/files/unzip/${encodeURIComponent(file)}?path=${encodeURIComponent(filePath)}`;

    await axios.post(apiURL, {}, {
      headers: {
        "Authorization": instance.Node.apiKey
      }
    });

    req.flash("success", "Unzipped successfully!");
    res.redirect(`/dashboard/instance/${id}/files${filePath ? `?path=${filePath}` : ""}`);

  } catch (err) {
    console.error(err);
    req.flash("error", "Unzip failed.");
    res.redirect(`/dashboard/instance/${id}/files`);
  }
});

module.exports = router;
