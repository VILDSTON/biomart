import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Complaint } from '@/lib/moderation';
import { escapeTelegramHtml } from '@/lib/security';
import { FOUNDER_TELEGRAM_ID, ADMIN_TELEGRAM_IDS, TELEGRAM_BOT_TOKEN } from '@/lib/constants';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { verifyAdminRequest } from '@/lib/seller-auth';

const COMPLAINTS_FILE = path.join(process.cwd(), 'data', 'complaints.json');

function getComplaintsFilePath(): string {
  try {
    const dir = path.dirname(COMPLAINTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return COMPLAINTS_FILE;
  } catch {
    const tmpDir = path.join('/tmp', 'biomart_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {}
    return path.join(tmpDir, 'complaints.json');
  }
}

const REASON_LABELS: Record<string, string> = {
  profanity: 'Нецензурная лексика / оскорбления',
  fraud: 'Мошенничество или обман',
  prohibited_goods: 'Запрещенный товар / контрафакт',
  spam: 'Спам или фейковые предложения',
  other: 'Другое нарушение',
};

function loadComplaints(): Complaint[] {
  const globalRef = globalThis as unknown as { __biomart_complaints?: Complaint[] };
  if (globalRef.__biomart_complaints && globalRef.__biomart_complaints.length > 0) {
    return globalRef.__biomart_complaints;
  }

  try {
    const filePath = getComplaintsFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalRef.__biomart_complaints = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Complaints] Failed to read complaints file:', e);
  }

  const initial: Complaint[] = [
    {
      id: 'comp-1',
      storeSlug: 'tashkent_drip',
      storeName: 'Tashkent Drip',
      reason: 'other',
      comment: 'Тестовая жалоба проверки модерации',
      reporterContact: '+998901234567',
      status: 'new',
      createdAt: new Date().toISOString(),
    },
  ];
  globalRef.__biomart_complaints = initial;
  return initial;
}

function saveComplaints(complaints: Complaint[]) {
  const globalRef = globalThis as unknown as { __biomart_complaints?: Complaint[] };
  globalRef.__biomart_complaints = complaints;

  try {
    const filePath = getComplaintsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(complaints, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Complaints] Failed to save complaints file:', e);
  }
}

async function sendTelegramComplaintNotification(complaint: Complaint) {
  const botToken = TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  // Resolve target chat IDs: Strictly Founder & Platform Admins (Never regular store owners!)
  const targetIds = new Set<string>();

  if (FOUNDER_TELEGRAM_ID) {
    targetIds.add(String(FOUNDER_TELEGRAM_ID));
  }
  ADMIN_TELEGRAM_IDS.forEach((id) => targetIds.add(String(id)));

  if (process.env.TELEGRAM_CHAT_ID?.trim()) {
    targetIds.add(process.env.TELEGRAM_CHAT_ID.trim());
  }

  if (targetIds.size === 0) {
    console.log('[Complaints] No telegram recipients found to deliver complaint.');
    return;
  }

  const reasonText = REASON_LABELS[complaint.reason] || complaint.reason;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const cleanContact = (complaint.reporterContact || '').replace(/[^\d+]/g, '');

  const text = `🚨 <b>НОВАЯ ЖАЛОБА В СИСТЕМЕ BIOMART</b>
━━━━━━━━━━━━━━━━━━━━━
🏪 <b>Магазин:</b> ${escapeTelegramHtml(complaint.storeName || complaint.storeSlug)} (<code>/${escapeTelegramHtml(complaint.storeSlug)}</code>)
${complaint.productTitle ? `📦 <b>Товар:</b> ${escapeTelegramHtml(complaint.productTitle)}\n` : ''}⚠️ <b>Причина:</b> ${escapeTelegramHtml(reasonText)}
💬 <b>Суть жалобы:</b>
<i>${escapeTelegramHtml(complaint.comment || 'Без описания')}</i>

👤 <b>Контакты заявителя:</b> <code>${escapeTelegramHtml(complaint.reporterContact || 'Не указаны')}</code>
━━━━━━━━━━━━━━━━━━━━━
⏰ <i>Только что • Модерация BioMart</i>`;

  const inlineButtons: Array<Array<{ text: string; url: string }>> = [
    [
      { text: '🛍 Открыть витрину', url: `${baseUrl}/${complaint.storeSlug}` },
      { text: '🛡 Модерация в Admin', url: `${baseUrl}/admin` },
    ],
  ];

  const rawContact = (complaint.reporterContact || '').trim();
  if (rawContact.startsWith('@')) {
    const username = rawContact.replace(/^@/, '');
    inlineButtons.push([
      { text: `💬 Написать в Telegram (@${username})`, url: `https://t.me/${username}` },
    ]);
  } else {
    const digits = rawContact.replace(/\D/g, '');
    if (digits.length >= 7) {
      inlineButtons.push([
        { text: '💬 Написать в Telegram', url: `https://t.me/+${digits}` },
        { text: '📞 Позвонить заявителю', url: `tel:+${digits}` },
      ]);
    }
  }

  for (const chatId of targetIds) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: inlineButtons,
          },
        }),
      });
    } catch (err) {
      console.warn(`[Complaints] Failed to send to chat_id ${chatId}:`, err);
    }
  }
}

export async function GET(req: NextRequest) {
  // Strictly verify admin authority before returning customer complaints
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Доступ запрещён: требуется авторизация администратора' }, { status: 401 });
  }
  const complaints = loadComplaints();
  return NextResponse.json({ complaints });
}

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`complaint_${clientIp}`, 5, 3600000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Слишком много обращений. Пожалуйста, подождите некоторое время.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { storeSlug, storeName, productId, productTitle, reason, comment, reporterContact } = body;

    if (!storeSlug || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const complaints = loadComplaints();

    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      storeSlug,
      storeName: storeName || storeSlug,
      productId,
      productTitle,
      reason,
      comment: comment || '',
      reporterContact: reporterContact || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    complaints.unshift(newComplaint);
    saveComplaints(complaints);

    // Send Telegram alert to admin / registered bot users asynchronously
    sendTelegramComplaintNotification(newComplaint).catch((e) =>
      console.warn('[Complaints] Notification error:', e)
    );

    return NextResponse.json({ success: true, complaint: newComplaint });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Доступ запрещён: требуется авторизация администратора' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    let complaints = loadComplaints();
    complaints = complaints.map((c) => (c.id === id ? { ...c, status } : c));
    saveComplaints(complaints);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
