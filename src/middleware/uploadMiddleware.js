const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const fileFilter = (_, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Seules les images sont autorisées'));
  cb(null, true);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });
