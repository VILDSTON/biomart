import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Complaint } from '@/lib/moderation';
import { escapeTelegramHtml } from '@/lib/security';

const COMPLAINTS_FILE = path.join(process.cwd(), 'data', 'complaints.json');

const REASON_LABELS: Record<string, string> = {
  profanity: 'Нецензурная лексика / оскорбления',
  fraud: 'Мошенничество или обман',
  prohibited_goods: 'Запрещенный товар / контрафакт',
  spam: 'Спам или фейковые предложения',
  other: 'Другое нарушение',
};

function loadComplaints(): Complaint[] {
  try {
    if (fs.existsSync(COMPLAINTS_FILE)) {
      const raw = fs.readFileSync(COMPLAINTS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[Complaints] Failed to read complaints file:', e);
  }
  return [
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
}

function saveComplaints(complaints: Complaint[]) {
  try {
    const dir = path.dirname(COMPLAINTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Complaints] Failed to save complaints file:', e);
  }
}

async function sendTelegramComplaintNotification(complaint: Complaint) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || process.env.TG_BOT_TOKEN?.trim();
  if (!botToken) return;

  // Resolve target chat IDs: env TELEGRAM_CHAT_ID + registered users in data/telegram_users.json
  const targetIds = new Set<string>();

  if (process.env.TELEGRAM_CHAT_ID?.trim()) {
    targetIds.add(process.env.TELEGRAM_CHAT_ID.trim());
  }

  try {
    const usersFile = path.join(process.cwd(), 'data', 'telegram_users.json');
    if (fs.existsSync(usersFile)) {
      const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      for (const key of Object.keys(usersData)) {
        // numeric chat ids
        if (/^-?\d+$/.test(key)) {
          targetIds.add(key);
        }
      }
    }
  } catch (e) {
    console.warn('[Complaints] Failed to read telegram_users for notification:', e);
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

  if (cleanContact.length >= 9) {
    inlineButtons.push([
      { text: '📞 Позвонить заявителю', url: `tel:${cleanContact}` },
      { text: '💬 Написать в Telegram', url: `https://t.me/${cleanContact.replace('+', '')}` },
    ]);
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

export async function GET() {
  const complaints = loadComplaints();
  return NextResponse.json({ complaints });
}

export async function POST(req: Request) {
  try {
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

export async function PATCH(req: Request) {
  try {
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
