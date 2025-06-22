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
      console.error(`[UNZIP] Instance with ID ${id} not found`);
      if (req.method === "POST") {
        return res.status(404).send("Instance not found");
      } else {
        return res.status(404).send("Instance not found");
      }
    }

    // Check authorization
    const userId = req.user && req.user.userId;
    if (!userId) {
      console.error(`[UNZIP] No user in request`);
      return res.status(401).send("User not authenticated");
    }
    const isAuthorized = await isUserAuthorizedForContainer(
      userId,
      instance.Id
    );
    if (!isAuthorized) {
      console.error(`[UNZIP] User ${userId} unauthorized for instance ${id}`);
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
        `[UNZIP] Instance ${id} missing required properties (VolumeId or Node info)`
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
      const nodeResponse = await axios.post(
        apiUrl,
        {}, // Empty body
        {
          auth: {
            username: "Skyport",
            password: instance.Node.apiKey,
          },
          timeout: 10000, // 10 seconds timeout
          validateStatus: () => true // We'll handle all status codes manually
        }
      );
      // Handle node API response
      if (nodeResponse.status >= 200 && nodeResponse.status < 300) {
        // Success
        if (
          req.method === "POST" ||
          req.xhr ||
          (req.headers.accept &&
            req.headers.accept.indexOf("application/json") !== -1)
        ) {
          return res.status(200).send("Unzipped successfully");
        } else {
          const redirectQuery = filePath
            ? `&path=${encodeURIComponent(filePath)}`
            : "";
          return res.redirect(
            `/instance/${id}/files?success=UNZIPPED${redirectQuery}`
          );
        }
      } else {
        // Node API error
        const errorMessage =
          (nodeResponse.data && nodeResponse.data.error) ||
          (typeof nodeResponse.data === "string" && nodeResponse.data) ||
          `Node API returned status ${nodeResponse.status}`;
        console.error(
          `[UNZIP] Node API error for instance ${id}, file ${file}:`,
          errorMessage
        );
        if (
          req.method === "POST" ||
          req.xhr ||
          (req.headers.accept &&
            req.headers.accept.indexOf("application/json") !== -1)
        ) {
          return res.status(500).send(
            errorMessage || "Failed to unzip file (Node error)"
          );
        } else {
          const redirectQuery = filePath
            ? `&path=${encodeURIComponent(filePath)}`
            : "";
          return res.redirect(
            `/instance/${id}/files?err=${encodeURIComponent(
              errorMessage
            )}${redirectQuery}`
          );
        }
      }
    } catch (error) {
      // Axios/connection error
      let errorMessage = "Failed to unzip file (connection error)";
      if (error.response) {
        errorMessage =
          (error.response.data && error.response.data.error) ||
          (typeof error.response.data === "string" && error.response.data) ||
          error.response.statusText ||
          errorMessage;
        console.error(
          `[UNZIP] Node API response error for instance ${id}, file ${file}:`,
          error.response.status,
          errorMessage
        );
      } else {
        errorMessage = error.message || errorMessage;
        console.error(
          `[UNZIP] Node API request error for instance ${id}, file ${file}:`,
          errorMessage
        );
      }
      if (
        req.method === "POST" ||
        req.xhr ||
        (req.headers.accept &&
          req.headers.accept.indexOf("application/json") !== -1)
      ) {
        return res.status(500).send(errorMessage);
      } else {
        const redirectQuery = filePath
          ? `&path=${encodeURIComponent(filePath)}`
          : "";
        return res.redirect(
          `/instance/${id}/files?err=${encodeURIComponent(
            errorMessage
          )}${redirectQuery}`
        );
      }
    }
  } catch (err) {
    console.error(
      `[UNZIP] Unexpected error in unzip route for instance ${id}:`,
      err
    );
    const redirectQuery = filePath
      ? `&path=${encodeURIComponent(filePath)}`
      : "";
    if (
      req.method === "POST" ||
      req.xhr ||
      (req.headers.accept &&
        req.headers.accept.indexOf("application/json") !== -1)
    ) {
      return res.status(500).send("Internal Server Error");
    } else {
      return res.redirect(
        `/instance/${id}/files?err=${encodeURIComponent(
          "Internal Server Error"
        )}${redirectQuery}`
      );
    }
  }
});

module.exports = router;
