const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { isUserAuthorizedForContainer } = require("../../utils/authHelper");

/**
 * Unzip endpoint
 * - GET: legacy, redirects after completion
 * - POST: AJAX/modal, returns plain text response
 */
router.all("/instance/:id/files/unzip/:file", async (req, res) => {
  const { id, file } = req.params;
  // Accept ?path=... as query param (for GET) or req.body.path (for POST)
  const filePath =
    req.method === "POST"
      ? (req.body && req.body.path) || req.query.path || ""
      : req.query.path || "";
  const subPath = filePath ? `?path=${encodeURIComponent(filePath)}` : "";

  try {
    // Validate parameters
    if (!id || !file) {
      if (req.method === "POST") {
        return res.status(400).send("Missing instance ID or file parameter");
      } else {
        return res.status(400).send("Missing instance ID or file parameter");
      }
    }

    const instance = await db.get(`${id}_instance`);
    if (!instance) {
      console.error(`Instance with ID ${id} not found`);
      if (req.method === "POST") {
        return res.status(404).send("Instance not found");
      } else {
        return res.status(404).send("Instance not found");
      }
    }

    // Check authorization
    const isAuthorized = await isUserAuthorizedForContainer(
      req.user.userId,
      instance.Id
    );
    if (!isAuthorized) {
      console.error(`User ${req.user.userId} unauthorized for instance ${id}`);
      if (req.method === "POST") {
        return res.status(403).send("Unauthorized access to this instance");
      } else {
        return res.status(403).send("Unauthorized access to this instance");
      }
    }

    // Check instance suspension status
    if (instance.suspended) {
      if (req.method === "POST") {
        return res.status(403).send("Instance suspended");
      } else {
        return res.redirect(`../../instances?err=SUSPENDED`);
      }
    }

    // Ensure instance has required properties
    if (
      !instance.VolumeId ||
      !instance.Node ||
      !instance.Node.address ||
      !instance.Node.port ||
      !instance.Node.apiKey
    ) {
      console.error(
        `Instance ${id} missing required properties (VolumeId or Node info)`
      );
      if (req.method === "POST") {
        return res.status(500).send("Instance configuration error");
      } else {
        return res.status(500).send("Instance configuration error");
      }
    }

    // Construct the API URL with proper path handling
    const apiUrl = `http://${instance.Node.address}:${instance.Node.port}/fs/${instance.VolumeId}/files/unzip/${encodeURIComponent(file)}${subPath}`;

    try {
      await axios.post(
        apiUrl,
        {},
        {
          auth: {
            username: "Skyport",
            password: instance.Node.apiKey,
          },
          timeout: 10000, // 10 seconds timeout
        }
      );
      // If AJAX/POST, send a 200 response. Else, redirect as usual.
      if (req.method === "POST" || req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(200).send("Unzipped successfully");
      } else {
        const redirectQuery = filePath ? `&path=${encodeURIComponent(filePath)}` : '';
        return res.redirect(`/instance/${id}/files?success=UNZIPPED${redirectQuery}`);
      }
    } catch (error) {
      console.error(`Error unzipping file ${file} for instance ${id}:`, error?.toString());
      let errorMessage = "Failed to unzip file";
      if (error.response && typeof error.response.data === "object") {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.response && typeof error.response.data === "string") {
        errorMessage = error.response.data || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (req.method === "POST" || req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(500).send(errorMessage);
      } else {
        const redirectQuery = filePath ? `&path=${encodeURIComponent(filePath)}` : '';
        return res.redirect(`/instance/${id}/files?err=${encodeURIComponent(errorMessage)}${redirectQuery}`);
      }
    }
  } catch (err) {
    console.error(`Unexpected error in unzip route for instance ${id}:`, err);
    const filePath = req.query.path || '';
    const redirectQuery = filePath ? `&path=${encodeURIComponent(filePath)}` : '';
    if (req.method === "POST" || req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
      return res.status(500).send("Internal Server Error");
    } else {
      return res.redirect(`/instance/${id}/files?err=${encodeURIComponent("Internal Server Error")}${redirectQuery}`);
    }
  }
});

module.exports = router;
