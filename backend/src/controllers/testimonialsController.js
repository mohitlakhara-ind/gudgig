import Testimonial from '../models/Testimonial.js';

export async function getPublicTestimonials(req, res) {
  try {
    const limitParam = Number(req.query?.limit);
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, limitParam)) : 50;

    const items = await Testimonial.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (items.length > 0) {
      return res.json({ success: true, data: items });
    }

    // Fallback: if nothing approved yet, return the latest submissions (unapproved) so UI can still show content.
    const fallback = await Testimonial.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: fallback });
  } catch (e) {
    console.error('[testimonials] getPublic error', e);
    res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
}

export async function submitTestimonial(req, res) {
  try {
    const body = req.body || {};
    const name = (body.name || '').trim();
    const content = (body.content || '').trim();
    const rating = body.rating ? Number(body.rating) : undefined;
    const email = (body.email || '').trim().toLowerCase();
    const userId = body.user || body.userId || undefined;

    if (!name || !content) {
      return res.status(400).json({ success: false, message: 'Name and content are required' });
    }

    const normalizedRating = Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 5;
    const payload = {
      user: userId,
      name,
      email: email || undefined,
      role: body.role || undefined,
      company: body.company || undefined,
      content,
      rating: normalizedRating,
      approved: false,
      metadata: body.metadata || {}
    };

    const query = userId
      ? { user: userId }
      : email
        ? { email }
        : { name };

    const existing = await Testimonial.findOne(query);
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      return res.json({ success: true, message: 'Testimonial updated and awaiting approval', data: existing });
    }

    const doc = new Testimonial(payload);
    await doc.save();

    res.status(201).json({ success: true, message: 'Testimonial submitted and awaiting approval', data: doc });
  } catch (e) {
    console.error('[testimonials] submit error', e);
    res.status(500).json({ success: false, message: 'Failed to submit testimonial' });
  }
}
