import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  Bot,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Inbox,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

const leads = [
  {
    name: "AgroTrade Hub",
    email: "buyers@agrotrade.eu",
    request: "500 t wheat, FOB Varna",
    status: "примерна заявка",
    next: "Да се върже към реална форма за запитвания.",
  },
  {
    name: "Farm operator",
    email: "demo@terraiq.me",
    request: "AI agronom + risk analysis",
    status: "demo",
    next: "Да се събира email от публичния сайт.",
  },
];

const plans = [
  { name: "Start", price: "49 EUR/мес", target: "малки ферми" },
  { name: "Business", price: "149 EUR/мес", target: "търговци и стопанства" },
  { name: "Enterprise", price: "499 EUR/мес", target: "големи агро компании" },
];

const systems = [
  {
    label: "Публичен сайт",
    value: "terraiq.me",
    ok: true,
    detail: "Основната landing страница е онлайн.",
  },
  {
    label: "Админ вход",
    value: "admin + парола",
    ok: true,
    detail: "Този панел е защитен с Basic Auth.",
  },
  {
    label: "CRM страница",
    value: "/crm",
    ok: true,
    detail: "Има demo CRM, който вече извиква TerraIQ AI през /api/ai.",
  },
  {
    label: "OpenAI връзка",
    value: "/api/ai",
    ok: true,
    detail: "Сървърен endpoint за AI анализи, защитен с OPENAI_API_KEY във Vercel.",
  },
  {
    label: "Плащания",
    value: "/pricing",
    ok: false,
    detail: "Има pricing екран, но трябва реална backend/Stripe връзка.",
  },
];

const nextActions = [
  "Да добавим форма на публичния сайт: име, email, стопанство, нужда.",
  "Да запазваме заявките в база данни, за да се виждат тук реално.",
  "Да вържем Stripe checkout към production backend.",
  "Да добавим статистики: посещения, заявки, планове, конверсии.",
  "Да сменим demo CRM данните с реални клиентски записи.",
];

function Metric({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Activity;
}) {
  return (
    <section className="glass-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-accent">
          <Icon size={20} />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof Activity;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <Icon className="text-accent" size={20} />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="glass-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <LockKeyhole size={14} />
                Админ панел
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                TerraIQ админ
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-secondary">
                Това е работният панел за TerraIQ. В момента показва demo
                заявки, планове и статус на системата. Истинските данни ще се
                появят тук, когато вържем форма, база данни и плащания.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/50 hover:text-accent"
              >
                Към сайта
                <ExternalLink size={15} />
              </Link>
              <Link
                href="/crm"
                className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-black"
              >
                CRM demo
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Сайт" value="Онлайн" Icon={Rocket} />
          <Metric label="Заявки" value="2 demo" Icon={Inbox} />
          <Metric label="Планове" value="3" Icon={BadgeEuro} />
          <Metric label="Достъп" value="Защитен" Icon={ShieldCheck} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel p-6">
            <SectionTitle icon={Users} title="Заявки и клиенти" />
            <div className="grid gap-3">
              {leads.map((lead) => (
                <div
                  key={lead.email}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{lead.name}</p>
                      <p className="mt-1 text-sm text-secondary">{lead.email}</p>
                    </div>
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">{lead.request}</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">{lead.next}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6">
            <SectionTitle icon={BadgeEuro} title="Планове за продажба" />
            <div className="grid gap-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-sm font-semibold text-accent">{plan.price}</p>
                  </div>
                  <p className="mt-2 text-sm text-secondary">{plan.target}</p>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent/50 hover:text-accent"
            >
              Виж pricing страницата
              <ExternalLink size={15} />
            </Link>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="glass-panel p-6">
            <SectionTitle icon={Globe2} title="Състояние на системата" />
            <div className="grid gap-3">
              {systems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-secondary">
                        {item.detail}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.ok
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {item.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      {item.ok ? "готово" : "за работа"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6">
            <SectionTitle icon={Bot} title="Какво реално трябва да се добави" />
            <div className="grid gap-3">
              {nextActions.map((action, index) => (
                <div
                  key={action}
                  className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-secondary">{action}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
