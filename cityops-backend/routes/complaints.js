const express = require('express');
const prisma = require('../prisma/client');
const { resolveWardAndDepartment } = require('../services/geo/geoService');
const { optionalAuth, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /complaints — submit a new complaint (citizen or guest)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      name,
      mobile,
      categoryId,
      category,
      photoUrl,
      photo,
      lat,
      lng,
      addressLine,
      address_line: addressLineSnake,
      landmark,
    } = req.body;
    const citizenId = req.user?.userId || null;
    const resolvedLat = Number(lat);
    const resolvedLng = Number(lng);
    const resolvedPhotoUrl = photoUrl || photo;

    if ((!categoryId && !category) || !resolvedPhotoUrl || !Number.isFinite(resolvedLat) || !Number.isFinite(resolvedLng)) {
      return res.status(400).json({ error: 'categoryId, photoUrl, lat, and lng are required' });
    }

    let categoryRecord = await prisma.category.findFirst({
      where: categoryId
        ? { id: categoryId }
        : { name: { equals: category, mode: 'insensitive' } },
    });
    if (!categoryRecord && categoryId) {
      categoryRecord = await prisma.category.findFirst({
        where: { name: { contains: categoryId, mode: 'insensitive' } },
      });
    }
    if (!categoryRecord) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }

    const duplicateCount = await prisma.complaint.count({
      where: {
        categoryId: categoryRecord.id,
        lat: { gte: resolvedLat - 0.002, lte: resolvedLat + 0.002 },
        lng: { gte: resolvedLng - 0.002, lte: resolvedLng + 0.002 },
      },
    });

    const trackingId = 'CO-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const geoResult = resolveWardAndDepartment(resolvedLat, resolvedLng, categoryRecord.name, duplicateCount);

    let wardId = null;
    let departmentId = null;

    if (geoResult?.ward) {
      const ward = await prisma.ward.findFirst({ where: { name: geoResult.ward } });
      wardId = ward?.id || null;
    }
    if (geoResult?.department) {
      const department = await prisma.department.findFirst({ where: { name: geoResult.department } });
      departmentId = department?.id || null;
    }

    const complaint = await prisma.complaint.create({
      data: {
        trackingId,
        citizenId,
        name: name || null,
        mobile: mobile || null,
        categoryId: categoryRecord.id,
        photoUrl: resolvedPhotoUrl,
        lat: resolvedLat,
        lng: resolvedLng,
        addressLine: addressLine || addressLineSnake || null,
        landmark,
        wardId,
        departmentId,
        priorityScore: geoResult?.priority || null,
        status: wardId && departmentId ? 'Assigned' : 'Submitted',
      },
    });

    res.status(201).json({
      trackingId: complaint.trackingId,
      status: complaint.status,
      ward: geoResult?.ward || null,
      department: geoResult?.department || null,
      priority: geoResult?.priority || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

// GET /complaints/track/:trackingId — public tracking, no login needed
router.get('/track/:trackingId', async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { trackingId: req.params.trackingId },
      select: {
        trackingId: true,
        status: true,
        name: true,
        mobile: true,
        photoUrl: true,
        addressLine: true,
        landmark: true,
        lat: true,
        lng: true,
        category: { select: { name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// GET /complaints/mine — logged-in citizen's own complaints
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { citizenId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        trackingId: true,
        status: true,
        addressLine: true,
        landmark: true,
        priorityScore: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your complaints' });
  }
});

// GET /complaints/assigned — office's assigned complaints (by their department)
router.get('/assigned', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'office') {
      return res.status(403).json({ error: 'Office access only' });
    }
    if (!req.user.departmentId) {
      return res.status(403).json({ error: 'This account is not linked to a department' });
    }

    const complaints = await prisma.complaint.findMany({
      where: { departmentId: req.user.departmentId },
      orderBy: [{ priorityScore: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        trackingId: true,
        status: true,
        photoUrl: true,
        addressLine: true,
        landmark: true,
        lat: true,
        lng: true,
        priorityScore: true,
        createdAt: true,
        name: true,
        mobile: true,
        statusUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: { evidencePhotoUrl: true, note: true, timestamp: true },
        },
        category: { select: { name: true } },
      },
    });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assigned complaints' });
  }
});

// PATCH /complaints/:id/status — generic status update (office)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'office') {
      return res.status(403).json({ error: 'Office access only' });
    }

    const { id } = req.params;
    const { status, note, evidencePhotoUrl } = req.body;

    const validStatuses = ['Submitted', 'Assigned', 'InProgress', 'PendingVerification', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    if (complaint.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'You are not authorized to update this complaint' });
    }

    const oldStatus = complaint.status;

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status },
    });

    await prisma.statusUpdate.create({
      data: {
        complaintId: id,
        updatedBy: req.user.userId,
        oldStatus,
        newStatus: status,
        note: note || null,
        evidencePhotoUrl: evidencePhotoUrl || null,
      },
    });

    res.json({ trackingId: updated.trackingId, status: updated.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /complaints/:id/complete — office marks work done, uploads evidence photo
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'office') {
      return res.status(403).json({ error: 'Only office accounts can mark work complete' });
    }

    const { id } = req.params;
    const { evidencePhotoUrl, note } = req.body;

    if (!evidencePhotoUrl) {
      return res.status(400).json({ error: 'evidencePhotoUrl is required to mark work complete' });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Not authorized for this complaint' });
    }

    const oldStatus = complaint.status;

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: 'PendingVerification' },
    });

    await prisma.statusUpdate.create({
      data: {
        complaintId: id,
        updatedBy: req.user.userId,
        oldStatus,
        newStatus: 'PendingVerification',
        note: note || 'Work completed, pending admin verification',
        evidencePhotoUrl,
      },
    });

    res.json({ trackingId: updated.trackingId, status: updated.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark complaint complete' });
  }
});

// PATCH /complaints/:id/verify — admin verifies completed work
router.patch('/:id/verify', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    const { id } = req.params;
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.status !== 'PendingVerification') {
      return res.status(400).json({ error: 'Complaint is not pending verification' });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: 'Resolved' },
    });

    await prisma.statusUpdate.create({
      data: {
        complaintId: id,
        updatedBy: req.user.userId,
        oldStatus: 'PendingVerification',
        newStatus: 'Resolved',
        note: 'Verified by admin',
      },
    });

    console.log(`[NOTIFY] Complaint ${updated.trackingId} resolved. Notify citizen: ${complaint.citizenId || complaint.mobile || 'guest, no contact info'}`);

    res.json({ trackingId: updated.trackingId, status: updated.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify complaint' });
  }
});

// GET /complaints/admin/all — admin-only, all complaints, filterable, priority-sorted
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    const { wardId, departmentId } = req.query;

    const complaints = await prisma.complaint.findMany({
      where: {
        ...(wardId ? { wardId } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      orderBy: [{ priorityScore: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        trackingId: true,
        status: true,
        priorityScore: true,
        photoUrl: true,
        addressLine: true,
        createdAt: true,
        category: { select: { name: true } },
        ward: { select: { name: true, zone: true } },
        department: { select: { name: true } },
        name: true,
        mobile: true,
        statusUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: { evidencePhotoUrl: true, note: true, timestamp: true },
        },
      },
    });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

module.exports = router;