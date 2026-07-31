import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        demo: "MVP Demo",
        workspace: "Workspace",
        plans: "Plans",
        admin: "Admin",
        request_demo: "Request Demo"
      },
      hero: {
        subtitle: "Strategic Operating System",
        title: "Terra",
        title_hl: "IQ",
        desc1: "The Intelligence Layer",
        desc2: "For Modern Agriculture",
        body: "Transform Data Into Decisions. TerraIQ combines data fabric, knowledge graph, agent mesh, digital twin and executive intelligence into one decision center.",
        btn_request: "Request Demo",
        btn_demo: "View MVP Demo"
      },
      platform: {
        kpi_title: "Executive Dashboard",
        title: "TerraIQ Executive Center",
        desc: "Core indicators for the current season. Investors should see business value first, not infrastructure noise.",
        status: "Decision layer online"
      },
      kpi: {
        expected_profit: "Expected Profit",
        expected_profit_desc: "current season",
        risk_index: "Risk Index",
        risk_index_desc: "low exposure",
        strategic_actions: "Strategic Actions",
        strategic_actions_desc: "ready for review",
        cash_flow: "Cash Flow",
        cash_flow_desc: "healthy"
      },
      crm: {
        title: "Commercial CRM",
        subtitle: "Inbound Leads & AI Deal Strategies",
        new_inquiry: "New CRM Inquiry",
        client: "Client",
        email: "Email",
        crop: "Crop",
        tons: "Tons",
        destination: "Destination",
        notes: "Notes",
        buyer_wallet: "Buyer wallet (0x...)",
        submit: "Submit with Auto AI Draft",
        submitting: "Submitting...",
        ask_title: "Ask TerraIQ AI",
        contact: "Contact",
        ask_placeholder: "Ask about recommendations, offers, risk, logistics, quality or contracts.",
        ask_example: "Example: Propose offer for 500t wheat FOB Varna with price and logistics...",
        ask_button: "Ask TerraIQ AI",
        thinking: "TerraIQ AI is thinking...",
        answer: "Answer",
        agent_strategy: "AI Agent Strategy",
        sales_agent: "SALES AGENT",
        finance_agent: "FINANCE AGENT",
        generated_draft: "Generated Draft",
        approve_send: "Approve & Send to Client",
        verification: "AI Verification",
        confidence: "Confidence",
        open_deal: "Open Deal in kontor21",
        auto_deploy: "Auto-deployed on AI approval",
        deal_price: "Deal price",
        empty: "No saved CRM records.",
        no_sales: "Missing sales analysis.",
        no_finance: "Missing finance analysis.",
        no_draft: "No generated draft.",
        loading: "Loading CRM records...",
        refresh: "Refresh",
        demand: "Demand",
        dest: "Dest",
        connected: "CRM connected to FastAPI and Postgres.",
        empty_status: "CRM is empty — no inquiries yet.",
        unavailable: "FastAPI CRM unavailable. Showing demo fallback data.",
        submitting_status: "Submitting CRM inquiry to FastAPI...",
        accepted: "Inquiry accepted with AI draft and recommendations.",
        failed_no_draft: "Inquiry saved but AI draft was not generated.",
        submit_error: "CRM submission failed. Check FastAPI, Postgres and OPENAI_API_KEY.",
        ai_error: "Could not get response from TerraIQ AI. Check OpenAI configuration.",
        prompt_1: "Propose offer for 500t wheat FOB Varna. Include price, timeline, logistics, quality requirements and draft email.",
        prompt_2: "Assess shipment delay risk. What payment terms if vessel is late and client wants compensation?",
        prompt_3: "Need 1200t sunflower to Constanta. Prepare commercial letter to potential client for 30 days.",
        prompt_4: "Compare three farms: price, logistics, quality grade, terms and export options via port."
      }
    }
  },
  bg: {
    translation: {
      nav: {
        demo: "Демо",
        workspace: "Портал",
        plans: "Абонаменти",
        admin: "Админ",
        request_demo: "Заявете Демо"
      },
      hero: {
        subtitle: "Стратегическа Оперативна Система",
        title: "Terra",
        title_hl: "IQ",
        desc1: "Интелигентният Слой",
        desc2: "За Модерното Земеделие",
        body: "Превърнете данните в решения. TerraIQ обединява бази данни, агенти с изкуствен интелект, дигитални двойници и управленска интелигентност в един център за решения.",
        btn_request: "Заявете Демо",
        btn_demo: "Вижте Демо"
      },
      platform: {
        kpi_title: "Контролен Панел",
        title: "TerraIQ Управленски Център",
        desc: "Ключови индикатори за текущия сезон. Инвеститорите трябва да виждат бизнес стойност, а не инфраструктурен шум.",
        status: "Системата за решения е онлайн"
      },
      kpi: {
        expected_profit: "Очаквана Печалба",
        expected_profit_desc: "текущ сезон",
        risk_index: "Индекс на Риска",
        risk_index_desc: "ниска експозиция",
        strategic_actions: "Стратегически Действия",
        strategic_actions_desc: "готови за преглед",
        cash_flow: "Паричен Поток",
        cash_flow_desc: "стабилен"
      },
      crm: {
        title: "Commercial CRM",
        subtitle: "Входящи Запитвания & AI Стратегии",
        new_inquiry: "Ново CRM запитване",
        client: "Клиент",
        email: "Email",
        crop: "Култура",
        tons: "Тона",
        destination: "Дестинация",
        notes: "Бележки",
        buyer_wallet: "Купувач wallet (0x...)",
        submit: "Изпрати с автоматичен AI draft",
        submitting: "Изпращане...",
        ask_title: "Попитай TerraIQ AI",
        contact: "За контакт",
        ask_placeholder: "Задай въпрос за препоръки, оферти, риск, логистика, качество или договор.",
        ask_example: "Например: Предложи оферта за 500 тона пшеница FOB Варна с цена и логистика включени...",
        ask_button: "Попитай TerraIQ AI",
        thinking: "TerraIQ AI мисли...",
        answer: "Отговор",
        agent_strategy: "AI Agent Strategy",
        sales_agent: "SALES AGENT",
        finance_agent: "FINANCE AGENT",
        generated_draft: "Generated Draft",
        approve_send: "Approve & Send to Client",
        verification: "AI Проверка",
        confidence: "Увереност",
        open_deal: "Отвори сделката в kontor21",
        auto_deploy: "Авто-разпределение при AI одобрение",
        deal_price: "Цена на сделката",
        empty: "Няма запазени CRM записи.",
        no_sales: "Липсва sales analysis.",
        no_finance: "Липсва finance analysis.",
        no_draft: "Няма генериран draft.",
        loading: "Зареждане на CRM записи...",
        refresh: "Refresh",
        demand: "Demand",
        dest: "Dest",
        connected: "CRM е свързан с FastAPI и Postgres.",
        empty_status: "CRM е празен — все още няма запазени запитвания.",
        unavailable: "FastAPI CRM не е достъпен. Показвам demo fallback данни.",
        submitting_status: "Изпращане на CRM запитване към FastAPI...",
        accepted: "Запитването е прието с AI draft и препоръки.",
        failed_no_draft: "Запитването е записано, но AI draft не беше генериран.",
        submit_error: "CRM изпращането не беше успешно. Проверете FastAPI, Postgres и OPENAI_API_KEY.",
        ai_error: "Не успях да получа отговор от TerraIQ AI. Проверете OpenAI конфигурацията.",
        prompt_1: "Предложи оферта за 500 тона пшеница доставка FOB Варна. Дай цена, срок, логистика, изисквания за качество и draft email.",
        prompt_2: "Оцени риск от забавяне на рейса. Какви условия за плащане, ако корабът закъснее и клиентът иска компенсация?",
        prompt_3: "Нужна поддръжка 1200 тн слънчоглед до Констанца. Подготви комерсиално писмо до потенциалния клиент за 30 дни.",
        prompt_4: "Сравни три ферми: цена, логистика, качество клас, условия и варианти за експорт през пристанище."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
