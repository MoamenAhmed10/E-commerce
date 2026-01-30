const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const upload = require("../middlewares/upload.middleware");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const ApiResponse = require("../utils/response");

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload single image
 * @access  Private (Admin)
 */
router.post("/image", auth, isAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return ApiResponse.badRequest(res, "No image file provided");
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  return ApiResponse.success(
    res,
    {
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    "Image uploaded successfully",
  );
});

/**
 * @route   POST /api/v1/upload/images
 * @desc    Upload multiple images (max 5)
 * @access  Private (Admin)
 */
router.post("/images", auth, isAdmin, upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return ApiResponse.badRequest(res, "No image files provided");
  }

  const images = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  }));

  return ApiResponse.success(
    res,
    {
      images,
      count: images.length,
    },
    "Images uploaded successfully",
  );
});

/**
 * @route   DELETE /api/v1/upload/:filename
 * @desc    Delete an uploaded image
 * @access  Private (Admin)
 */
router.delete("/:filename", auth, isAdmin, (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, "../uploads", filename);

  if (!fs.existsSync(filepath)) {
    return ApiResponse.notFound(res, "Image not found");
  }

  try {
    fs.unlinkSync(filepath);
    return ApiResponse.success(res, null, "Image deleted successfully");
  } catch (error) {
    return ApiResponse.error(res, "Failed to delete image");
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof require("multer").MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return ApiResponse.badRequest(res, "File too large. Maximum size is 5MB");
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return ApiResponse.badRequest(res, "Too many files. Maximum is 5 files");
    }
    return ApiResponse.badRequest(res, error.message);
  }

  if (error) {
    return ApiResponse.badRequest(res, error.message);
  }

  next();
});

module.exports = router;
