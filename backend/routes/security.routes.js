const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const securityController = require('../controllers/security.controller');

// All routes require authentication
router.use(authenticate);

// 2FA
router.post('/2fa/setup', securityController.setup2FA);
router.post('/2fa/verify', securityController.verify2FA);
router.post('/2fa/disable', securityController.disable2FA);
router.get('/2fa/status', securityController.get2FAStatus);

// Sessions
router.get('/sessions', securityController.getSessions);
router.delete('/sessions/:sessionId', securityController.revokeSession);
router.delete('/sessions', securityController.revokeAllSessions);

module.exports = router;