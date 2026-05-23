import {Router} from 'express';
import {AppDataSource} from '../config/data-source';
import {Report} from '../entities/Report';
import {requireAuth, AuthenticatedRequest} from '../middlewares/auth';
import {enqueueNotification} from '../worker/producer';

const router = Router();
const repo = () => AppDataSource.getRepository(Report);

const fallbackSummary = (type: string, parameters: Record<string, unknown>) => ({
  type,
  parameters,
  summary: 'AI summary unavailable; fallback report generated from local rules.',
});

async function generateSummary(type: string, parameters: Record<string, unknown>) {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';
  try {
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({type, parameters}),
    });

    if (!response.ok) return fallbackSummary(type, parameters);
    return await response.json();
  } catch (_err) {
    return fallbackSummary(type, parameters);
  }
}

router.get('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const reports = await repo().find({where: {userId: user?.id}});
  res.json(reports);
});

router.post('/generate', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const {title, type = 'daily', parameters = {}, recipients = [user?.email || 'noreply@example.com']} = req.body;

  const summary = await generateSummary(type, parameters);
  const report = repo().create({
    userId: user?.id,
    title,
    type,
    parameters,
    summary,
    recipients,
  });

  await repo().save(report);

  if (recipients.length) {
    await enqueueNotification({
      type: 'email',
      to: recipients[0],
      subject: `Stock Manager Report: ${title}`,
      body: JSON.stringify(summary, null, 2),
    });
  }

  res.status(201).json(report);
});

export default router;
