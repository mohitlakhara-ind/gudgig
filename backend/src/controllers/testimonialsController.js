import Testimonial from '../models/Testimonial.js';

export async function getPublicTestimonials(req, res) {
  try {
    const items = await Testimonial.find({ approved: true }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: items });
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

    if (!name || !content) {
      return res.status(400).json({ success: false, message: 'Name and content are required' });
    }

    const doc = new Testimonial({
      user: body.user || undefined,
      name,
      role: body.role || undefined,
      company: body.company || undefined,
      content,
      rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 5,
      approved: false,
      metadata: body.metadata || {}
    });

    await doc.save();

    // Optionally: queue an admin notification here

    res.status(201).json({ success: true, message: 'Testimonial submitted and awaiting approval' });
  } catch (e) {
    console.error('[testimonials] submit error', e);
    res.status(500).json({ success: false, message: 'Failed to submit testimonial' });
  }
}
